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
        Schema::create('ucesnici_dogadjaja', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dogadjaj_id')->constrained('dogadjaji')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('status')->default('pozvan'); // pozvan/prihvatio/odbio
            $table->timestamp('notifikovan_u')->nullable();

            $table->timestamps();


             $table->unique(['dogadjaj_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ucesnici_dogadjaja');
    }
};
