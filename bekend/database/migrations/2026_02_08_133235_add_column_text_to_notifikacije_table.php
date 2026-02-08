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
        Schema::table('notifikacije', function (Blueprint $table) {
            $table->string('text')->nullable()->after('id'); // Dodajemo novu kolonu 'tekst' nakon 'id'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifikacije', function (Blueprint $table) {
            $table->dropColumn('text');

        });
    }
};
