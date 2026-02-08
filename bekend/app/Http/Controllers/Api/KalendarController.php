<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kalendar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KalendarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
         $kalendari = Kalendar::where('user_id', $request->user()->id)
            ->orderBy('id', 'desc')
            ->get();
        iF($kalendari->isEmpty()){
            return response()->json([
                'message' => 'Nema kalendara za ovog korisnika.',
                'data' => []
            ]);
        }
        return response()->json([
            'data' => $kalendari
        ]);
        //return Kalendar::with('korisnik')->get();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
         $validator = Validator::make(
            $request->all(),
            [
                'naziv' => ['required', 'string', 'max:255'],
            ],
            [
                'naziv.required' => 'Naziv kalendara je obavezan.',
                'naziv.string' => 'Naziv kalendara mora biti tekst.',
                'naziv.max' => 'Naziv kalendara može imati najviše 255 karaktera.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kalendar = Kalendar::create([
            'user_id' => $request->user()->id,
            'naziv' => $validator->validated()['naziv'],
        ]);

        return response()->json([
            'message' => 'Kalendar je uspešno kreiran.',
            'data' => $kalendar,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return Kalendar::find($id);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Kalendar $kalendar)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request,$id)
    {
         $kalendar = Kalendar::find($id);
           if (!$kalendar) {
            return response()->json([
                'message' => 'Kalendar nije pronađen.'
            ], 404);
        }
        $validator = Validator::make(
            $request->all(),
            [
                'naziv' => ['required', 'string', 'max:255'],
            ],
            [
                'naziv.required' => 'Naziv kalendara je obavezan.',
                'naziv.string' => 'Naziv kalendara mora biti tekst.',
                'naziv.max' => 'Naziv kalendara može imati najviše 255 karaktera.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $kalendar->update([
            'naziv' => $validator->validated()['naziv'],
        ]);

        return response()->json([
            'message' => 'Kalendar je uspešno ažuriran.',
            'data' => $kalendar,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy( $id)
    {
        $kalendar = Kalendar::find($id);
        if ($kalendar) {
            $kalendar->delete();
            return response()->json([
                'message' => 'Kalendar je uspešno obrisan.',
            ]);
        }
        return response()->json([
            'message' => 'Kalendar nije pronađen.',
        ], 404);
    }
}
