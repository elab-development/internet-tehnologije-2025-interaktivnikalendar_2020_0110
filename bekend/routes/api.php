<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

 

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {

    // trenutno ulogovan korisnik
    Route::get('/me', [AuthController::class, 'me']);

    // logout (briše trenutni token)
    Route::post('/logout', [AuthController::class, 'logout']);
});