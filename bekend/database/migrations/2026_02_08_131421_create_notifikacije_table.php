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
        Schema::create('notifikacije', function (Blueprint $table) {
            $table->id();
             $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('dogadjaj_id')->constrained('dogadjaji')->cascadeOnDelete();

            $table->string('kanal')->default('email'); // npr: email
            $table->dateTime('poslati_u');             // kada treba poslati
            $table->dateTime('poslato_u')->nullable(); // kada je poslato

            $table->string('status')->default('na_cekanju'); // na_cekanju/poslato/greska
            $table->text('greska')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikacije');
    }
};
