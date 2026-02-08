<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('dogadjaji', function (Blueprint $table) {
            $table->id();
             $table->foreignId('kalendar_id')->constrained('kalendari')->cascadeOnDelete();

            $table->string('naslov');
            $table->text('opis')->nullable();
            $table->string('lokacija')->nullable();

            $table->dateTime('pocetak');
            $table->dateTime('kraj');

            $table->boolean('ceo_dan')->default(false);

            $table->string('status')->default('planirano'); // planirano/otkazano/zavrseno
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dogadjaji');
    }
};
