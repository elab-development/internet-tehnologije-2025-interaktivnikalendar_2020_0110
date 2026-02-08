<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DogadjajController;
use App\Http\Controllers\Api\KalendarController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

 

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);



Route::get('/kalendari/{id}', [KalendarController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {

    // trenutno ulogovan korisnik
    Route::get('/me', [AuthController::class, 'me']);

    // logout (briše trenutni token)
    Route::post('/logout', [AuthController::class, 'logout']);


    Route::get('/kalendari', [KalendarController::class, 'index']); 
    Route::post('/kalendari', [KalendarController::class, 'store']);
    Route::delete('/kalendari/{id}', [KalendarController::class, 'destroy']);
    Route::put('/kalendari/{id}', [KalendarController::class, 'update']);



    Route::get('/dogadjaji', [DogadjajController::class, 'index']);
    Route::post('/dogadjaji', [DogadjajController::class, 'store']);
    Route::get('/dogadjaji/{id}', [DogadjajController::class, 'show']);
    Route::put('/dogadjaji/{id}', [DogadjajController::class, 'update']);
    Route::delete('/dogadjaji/{id}', [DogadjajController::class, 'destroy']);
});


