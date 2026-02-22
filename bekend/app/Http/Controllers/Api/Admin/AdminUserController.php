<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string)$request->query('q', ''));
        $perPage = (int)$request->query('per_page', 15);
        if ($perPage < 5) $perPage = 5;
        if ($perPage > 100) $perPage = 100;

        $query = User::query()->orderBy('id', 'desc');

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $page = $query->paginate($perPage);

        return response()->json([
            'data' => $page->items(),
            'meta' => [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ]
        ]);
    }

    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Korisnik nije pronađen.'], 404);
        }

        return response()->json(['data' => $user]);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Korisnik nije pronađen.'], 404);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'name' => ['sometimes', 'string', 'max:255'],
                'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $user->id],
                'uloga' => ['sometimes', 'in:admin,tim_lider,zaposleni'],
            ],
            [
                'email.unique' => 'Ovaj email već postoji.',
                'uloga.in' => 'Uloga mora biti admin, tim_lider ili zaposleni.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $user->update($data);

        return response()->json([
            'message' => 'Korisnik je uspešno ažuriran.',
            'data' => $user
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $auth = $request->user();

        if ((int)$auth->id === (int)$id) {
            return response()->json([
                'message' => 'Ne možete obrisati sami sebe.'
            ], 422);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Korisnik nije pronađen.'], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Korisnik je obrisan.'
        ]);
    }
}