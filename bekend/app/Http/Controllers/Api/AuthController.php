<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use App\Models\User;

class AuthController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | REGISTER
    |--------------------------------------------------------------------------
    */
    public function register(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'confirmed', Password::min(6)],
                'uloga' => ['required', 'in:admin,tim_lider,zaposleni'],
            ],
            [
                'name.required' => 'Ime je obavezno.',
                'email.required' => 'Email je obavezan.',
                'email.email' => 'Email nije validan.',
                'email.unique' => 'Ovaj email već postoji.',
                'password.required' => 'Lozinka je obavezna.',
                'password.confirmed' => 'Lozinke se ne poklapaju.',
                'password.min' => 'Lozinka mora imati najmanje 6 karaktera.',
                'uloga.required' => 'Uloga je obavezna.',
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

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'], 
            'uloga' => $data['uloga'],
        ]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Registracija uspešna.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */
    public function login(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'email' => ['required', 'email'],
                'password' => ['required', 'string'],
            ],
            [
                'email.required' => 'Email je obavezan.',
                'email.email' => 'Email nije validan.',
                'password.required' => 'Lozinka je obavezna.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija neuspešna.',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Pogrešan email ili lozinka.'
            ], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'message' => 'Uspešna prijava.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ME (auth:sanctum)
    |--------------------------------------------------------------------------
    */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | LOGOUT (auth:sanctum)
    |--------------------------------------------------------------------------
    */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Uspešno ste se odjavili.'
        ]);
    }
}
