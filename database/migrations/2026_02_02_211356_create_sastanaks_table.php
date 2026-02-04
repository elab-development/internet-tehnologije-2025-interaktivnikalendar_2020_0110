<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sastanci', function (Blueprint $table) {
            $table->id();

            $table->string('naziv');
            $table->dateTime('pocetak');
            $table->dateTime('kraj');
            $table->string('lokacija')->nullable();

            $table->unsignedBigInteger('sala_id')->nullable();
            $table->unsignedBigInteger('kreirao_id');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sastanci');
    }
};
