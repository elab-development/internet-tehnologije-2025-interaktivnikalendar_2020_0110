<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\DogadjajKreiranMail;
use App\Models\Dogadjaj;
use App\Models\Kalendar;
use App\Models\Notifikacija;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class DogadjajController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $dogadjaji = Dogadjaj::whereHas('kalendar', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->orderBy('pocetak', 'asc')
            ->get();

        return response()->json([
            'data' => $dogadjaji
        ]);
    }

    // POST /api/dogadjaji
    public function store(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        $validator = Validator::make(
            $request->all(),
            [
                'kalendar_id' => ['required', 'integer', 'exists:kalendari,id'],
                'naziv' => ['required', 'string', 'max:255'],
                'opis' => ['nullable', 'string'],
                'lokacija' => ['nullable', 'string', 'max:255'],

                'pocetak' => ['required', 'date'],
                'kraj' => ['required', 'date'],

                'ceo_dan' => ['nullable', 'boolean'],
                'status' => ['nullable', 'in:planirano,otkazano,zavrseno'],

                'ponavljajuci' => ['nullable', 'boolean'],
                'period_ponavljanja' => ['nullable', 'in:dnevno,nedeljno,mesecno,godisnje'],
                'ponavlja_se_do' => ['nullable', 'date'],
            ],
            [
                'kalendar_id.required' => 'Kalendar je obavezan.',
                'kalendar_id.exists' => 'Izabrani kalendar ne postoji.',
                'naziv.required' => 'Naziv događaja je obavezan.',
                'naziv.max' => 'Naziv može imati najviše 255 karaktera.',
                'pocetak.required' => 'Početak je obavezan.',
                'pocetak.date' => 'Početak mora biti validan datum/vreme.',
                'kraj.required' => 'Kraj je obavezan.',
                'kraj.date' => 'Kraj mora biti validan datum/vreme.',
                'status.in' => 'Status može biti: planirano, otkazano, zavrseno.',
                'period_ponavljanja.in' => 'Period ponavljanja može biti: dnevno, nedeljno, mesecno, godisnje.',
                'ponavlja_se_do.date' => 'Ponavlja se do mora biti validan datum/vreme.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Ownership provera (kalendar mora pripadati ulogovanom korisniku)
        $kalendar = Kalendar::where('id', $data['kalendar_id'])
            ->where('user_id', $userId)
            ->first();

        if (!$kalendar) {
            return response()->json([
                'message' => 'Nemate pristup ovom kalendaru.'
            ], 403);
        }

        // logička provera vremena
        if (strtotime($data['kraj']) <= strtotime($data['pocetak'])) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => [
                    'kraj' => ['Kraj mora biti posle početka.']
                ]
            ], 422);
        }

        $ponavljajuci = (bool)($data['ponavljajuci'] ?? false);
        if ($ponavljajuci) {
            if (empty($data['period_ponavljanja'])) {
                return response()->json([
                    'message' => 'Validacija neuspešna.',
                    'errors' => [
                        'period_ponavljanja' => ['Ako je događaj ponavljajući, period_ponavljanja je obavezan.']
                    ]
                ], 422);
            }
            if (empty($data['ponavlja_se_do'])) {
                return response()->json([
                    'message' => 'Validacija neuspešna.',
                    'errors' => [
                        'ponavlja_se_do' => ['Ako je događaj ponavljajući, ponavlja_se_do je obavezno.']
                    ]
                ], 422);
            }
        }

        // 1) Kreiranje događaja
        $dogadjaj = Dogadjaj::create([
            'kalendar_id' => $data['kalendar_id'],
            'naziv' => $data['naziv'],
            'opis' => $data['opis'] ?? null,
            'lokacija' => $data['lokacija'] ?? null,

            'pocetak' => $data['pocetak'],
            'kraj' => $data['kraj'],

            'ceo_dan' => $data['ceo_dan'] ?? false,
            'status' => $data['status'] ?? 'planirano',

            'ponavljajuci' => $ponavljajuci,
            'period_ponavljanja' => $data['period_ponavljanja'] ?? null,
            'ponavlja_se_do' => $data['ponavlja_se_do'] ?? null,
        ]);

        // 2) Kreiranje notifikacije u bazi (status: na_cekanju)
        $notifText = "Dodat događaj: {$dogadjaj->naziv} ({$dogadjaj->pocetak} - {$dogadjaj->kraj})";
        $notifikacija = null;

        try {
            $notifikacija = Notifikacija::create([
                'user_id' => $userId,
                'dogadjaj_id' => $dogadjaj->id,
                'kanal' => 'email',
                'poslati_u' => now(),
                'status' => 'na_cekanju',
                'text' => $notifText,
            ]);
        } catch (\Throwable $e) {
            // ne rušimo kreiranje događaja ako notifikacija ne uspe,
            // ali logujemo jer je bitno za debug
            Log::error("Notifikacija create failed for dogadjaj {$dogadjaj->id}: " . $e->getMessage());
        }

        // 3) Slanje email-a (Mailtrap)
        // primaoc: kalendar->email (ako postoji) ili user email
        $toEmail = $kalendar->email ?: $user->email;

        try {
            if ($toEmail) {
                // ako imaš relation, možeš i $dogadjaj->load('kalendar');
                Mail::to($toEmail)->send(new DogadjajKreiranMail($dogadjaj, $kalendar));
            }

            // update notifikacije: poslato
            if ($notifikacija) {
                $notifikacija->update([
                    'status' => 'poslato',
                ]);
            }
        } catch (\Throwable $e) {
            Log::error("Mail send failed for dogadjaj {$dogadjaj->id}: " . $e->getMessage());

            // update notifikacije: greska
            if ($notifikacija) {
                $notifikacija->update([
                    'status' => 'greska',
                    'text' => ($notifikacija->text ? $notifikacija->text . "\n" : "") . "Mail error: " . $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => 'Događaj je uspešno kreiran.',
            'data' => $dogadjaj,
        ], 201);
    }

    // GET /api/dogadjaji/{id}
    public function show(Request $request, $id)
    {
        $userId = $request->user()->id;

        $dogadjaj = Dogadjaj::where('id', $id)
            ->whereHas('kalendar', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->first();

        if (!$dogadjaj) {
            return response()->json([
                'message' => 'Događaj nije pronađen.'
            ], 404);
        }

        return response()->json([
            'data' => $dogadjaj
        ]);
    }

    // PUT /api/dogadjaji/{id}
    public function update(Request $request, $id)
    {
        $userId = $request->user()->id;

        $dogadjaj = Dogadjaj::where('id', $id)
            ->whereHas('kalendar', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->first();

        if (!$dogadjaj) {
            return response()->json([
                'message' => 'Događaj nije pronađen.'
            ], 404);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'kalendar_id' => ['required', 'integer', 'exists:kalendari,id'],
                'naziv' => ['required', 'string', 'max:255'],
                'opis' => ['nullable', 'string'],
                'lokacija' => ['nullable', 'string', 'max:255'],

                'pocetak' => ['required', 'date'],
                'kraj' => ['required', 'date'],

                'ceo_dan' => ['nullable', 'boolean'],
                'status' => ['nullable', 'in:planirano,otkazano,zavrseno'],

                'ponavljajuci' => ['nullable', 'boolean'],
                'period_ponavljanja' => ['nullable', 'in:dnevno,nedeljno,mesecno,godisnje'],
                'ponavlja_se_do' => ['nullable', 'date'],
            ],
            [
                'kalendar_id.required' => 'Kalendar je obavezan.',
                'kalendar_id.exists' => 'Izabrani kalendar ne postoji.',
                'naziv.required' => 'Naziv događaja je obavezan.',
                'pocetak.required' => 'Početak je obavezan.',
                'kraj.required' => 'Kraj je obavezan.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $kalendar = Kalendar::where('id', $data['kalendar_id'])
            ->where('user_id', $userId)
            ->first();

        if (!$kalendar) {
            return response()->json([
                'message' => 'Nemate pristup ovom kalendaru.'
            ], 403);
        }

        if (strtotime($data['kraj']) <= strtotime($data['pocetak'])) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => [
                    'kraj' => ['Kraj mora biti posle početka.']
                ]
            ], 422);
        }

        $ponavljajuci = (bool)($data['ponavljajuci'] ?? false);
        if ($ponavljajuci) {
            if (empty($data['period_ponavljanja'])) {
                return response()->json([
                    'message' => 'Validacija neuspešna.',
                    'errors' => [
                        'period_ponavljanja' => ['Ako je događaj ponavljajući, period_ponavljanja je obavezan.']
                    ]
                ], 422);
            }
            if (empty($data['ponavlja_se_do'])) {
                return response()->json([
                    'message' => 'Validacija neuspešna.',
                    'errors' => [
                        'ponavlja_se_do' => ['Ako je događaj ponavljajući, ponavlja_se_do je obavezno.']
                    ]
                ], 422);
            }
        }

        $dogadjaj->update([
            'kalendar_id' => $data['kalendar_id'],
            'naziv' => $data['naziv'],
            'opis' => $data['opis'] ?? null,
            'lokacija' => $data['lokacija'] ?? null,

            'pocetak' => $data['pocetak'],
            'kraj' => $data['kraj'],

            'ceo_dan' => $data['ceo_dan'] ?? false,
            'status' => $data['status'] ?? $dogadjaj->status,

            'ponavljajuci' => $ponavljajuci,
            'period_ponavljanja' => $data['period_ponavljanja'] ?? null,
            'ponavlja_se_do' => $data['ponavlja_se_do'] ?? null,
        ]);

        return response()->json([
            'message' => 'Događaj je uspešno ažuriran.',
            'data' => $dogadjaj,
        ]);
    }

    // DELETE /api/dogadjaji/{id}
    public function destroy(Request $request, $id)
    {
        $userId = $request->user()->id;

        $dogadjaj = Dogadjaj::where('id', $id)
            ->whereHas('kalendar', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->first();

        if (!$dogadjaj) {
            return response()->json([
                'message' => 'Događaj nije pronađen.'
            ], 404);
        }

        $dogadjaj->delete();

        return response()->json([
            'message' => 'Događaj je uspešno obrisan.'
        ]);
    }
}