<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistike', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('admin_id');
            $table->string('tip');
            $table->json('podaci');
            $table->dateTime('kreirano_u');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistike');
    }
};
