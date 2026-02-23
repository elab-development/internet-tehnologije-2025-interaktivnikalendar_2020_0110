<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\DogadjajKreiranMail;
use App\Models\Dogadjaj;
use App\Models\Kalendar;
use App\Models\Notifikacija;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class AdminDogadjajiController extends Controller
{
    // POST /api/admin/dogadjaji/assign
    // Body:
    // {
    //   "user_id": 5,
    //   "event": { naziv, opis, lokacija, pocetak, kraj, ceo_dan, status, ponavljajuci, period_ponavljanja, ponavlja_se_do }
    // }
    public function assign(Request $request)
    {
        $auth = $request->user();

     

        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'event' => ['required', 'array'],
            'event.naziv' => ['required', 'string', 'max:255'],
            'event.opis' => ['nullable', 'string'],
            'event.lokacija' => ['nullable', 'string', 'max:255'],
            'event.pocetak' => ['required', 'date'],
            'event.kraj' => ['required', 'date'],
            'event.ceo_dan' => ['nullable', 'boolean'],
            'event.status' => ['nullable', 'in:planirano,otkazano,zavrseno'],
            'event.ponavljajuci' => ['nullable', 'boolean'],
            'event.period_ponavljanja' => ['nullable', 'in:dnevno,nedeljno,mesecno,godisnje'],
            'event.ponavlja_se_do' => ['nullable', 'date'],
        ], [
            'user_id.required' => 'Korisnik je obavezan.',
            'user_id.exists' => 'Korisnik ne postoji.',
            'event.required' => 'Događaj je obavezan.',
            'event.naziv.required' => 'Naziv događaja je obavezan.',
            'event.pocetak.required' => 'Početak je obavezan.',
            'event.kraj.required' => 'Kraj je obavezan.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $targetUser = User::find($data['user_id']);
        $ev = $data['event'];

        if (strtotime($ev['kraj']) <= strtotime($ev['pocetak'])) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => ['kraj' => ['Kraj mora biti posle početka.']],
            ], 422);
        }

        $ponavljajuci = (bool)($ev['ponavljajuci'] ?? false);
        if ($ponavljajuci) {
            if (empty($ev['period_ponavljanja'])) {
                return response()->json([
                    'message' => 'Validacija neuspešna.',
                    'errors' => ['period_ponavljanja' => ['Ako je događaj ponavljajući, period_ponavljanja je obavezan.']],
                ], 422);
            }
            if (empty($ev['ponavlja_se_do'])) {
                return response()->json([
                    'message' => 'Validacija neuspešna.',
                    'errors' => ['ponavlja_se_do' => ['Ako je događaj ponavljajući, ponavlja_se_do je obavezno.']],
                ], 422);
            }
        }

        // 1) nadji ili napravi kalendar za target user-a
        // (ako već imate "default" kalendar logiku, koristi tu; ovo je najlakša varijanta)
        $kalendar = Kalendar::firstOrCreate(
            ['user_id' => $targetUser->id, 'naziv' => 'Moj kalendar'],
            ['email' => $targetUser->email]
        );

        // 2) kreiraj kopiju dogadjaja u target user kalendaru
        $dogadjaj = Dogadjaj::create([
            'kalendar_id' => $kalendar->id,
            'naziv' => $ev['naziv'],
            'opis' => $ev['opis'] ?? null,
            'lokacija' => $ev['lokacija'] ?? null,
            'pocetak' => $ev['pocetak'],
            'kraj' => $ev['kraj'],
            'ceo_dan' => $ev['ceo_dan'] ?? false,
            'status' => $ev['status'] ?? 'planirano',
            'ponavljajuci' => $ponavljajuci,
            'period_ponavljanja' => $ev['period_ponavljanja'] ?? null,
            'ponavlja_se_do' => $ev['ponavlja_se_do'] ?? null,
        ]);

        // 3) notifikacija u bazi (app + email)
        $notifText = "Dodeljen događaj: {$dogadjaj->naziv} ({$dogadjaj->pocetak} - {$dogadjaj->kraj})";

        try {
            Notifikacija::create([
                'user_id' => $targetUser->id,
                'dogadjaj_id' => $dogadjaj->id,
                'kanal' => 'app',
                'poslati_u' => now(),
                'status' => 'poslato',
                'text' => $notifText,
            ]);
        } catch (\Throwable $e) {
            Log::error("App notifikacija failed: " . $e->getMessage());
        }

        // 4) email (korisniku)
        try {
            Mail::to($targetUser->email)->send(new DogadjajKreiranMail($dogadjaj, $kalendar));

            
            try {
                Notifikacija::create([
                    'user_id' => $targetUser->id,
                    'dogadjaj_id' => $dogadjaj->id,
                    'kanal' => 'email',
                    'poslati_u' => now(),
                    'status' => 'poslato',
                    'text' => $notifText,
                ]);
            } catch (\Throwable $e) {
                Log::error("Email notifikacija record failed: " . $e->getMessage());
            }
        } catch (\Throwable $e) {
            Log::error("Mail send failed (assign) dogadjaj {$dogadjaj->id}: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Događaj dodeljen korisniku.',
            'data' => $dogadjaj,
        ], 201);
    }
}