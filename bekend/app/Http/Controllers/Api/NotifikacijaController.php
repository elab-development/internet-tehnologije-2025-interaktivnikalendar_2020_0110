<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikacija;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotifikacijaController extends Controller
{
    // GET /api/notifikacije
    public function index()
    {
        return response()->json(Notifikacija::all());
    }

    // POST /api/notifikacije
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => ['required', 'exists:users,id'],
            'dogadjaj_id' => ['required', 'exists:dogadjaji,id'],
            'kanal' => ['required', 'in:email'],
            'poslati_u' => ['required', 'date'],
            'status' => ['required', 'in:na_cekanju,poslato,greska'],
            'text' => ['nullable', 'string'],
             
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $notifikacija = Notifikacija::create($validator->validated());

        return response()->json($notifikacija, 201);
    }

    // GET /api/notifikacije/{id}
    public function show($id)
    {
        $notifikacija = Notifikacija::find($id);

        if (!$notifikacija) {
            return response()->json(['message' => 'Notifikacija nije pronađena'], 404);
        }

        return response()->json($notifikacija);
    }

    // PUT /api/notifikacije/{id}
    public function update(Request $request, $id)
    {
        $notifikacija = Notifikacija::find($id);

        if (!$notifikacija) {
            return response()->json(['message' => 'Notifikacija nije pronađena'], 404);
        }

        $validator = Validator::make($request->all(), [
            'kanal' => ['required', 'in:email'],
            'poslati_u' => ['required', 'date'],
            'status' => ['required', 'in:na_cekanju,poslato,greska'],
            'text' => ['nullable', 'string'],
           
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $notifikacija->update($validator->validated());

        return response()->json($notifikacija);
    }

    // DELETE /api/notifikacije/{id}
    public function destroy($id)
    {
        $notifikacija = Notifikacija::find($id);

        if (!$notifikacija) {
            return response()->json(['message' => 'Notifikacija nije pronađena'], 404);
        }

        $notifikacija->delete();

        return response()->json(['message' => 'Obrisano']);
    }
}
