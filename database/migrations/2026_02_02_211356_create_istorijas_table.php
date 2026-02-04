<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('istorija', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('korisnik_id');
            $table->string('tip'); // kasnije ćemo ga ograničiti na enum
            $table->unsignedBigInteger('aktivnost_id');
            $table->string('status')->nullable();
            $table->dateTime('zatvoreno_u')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('istorija');
    }
};
