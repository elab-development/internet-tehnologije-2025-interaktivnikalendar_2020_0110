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
        Schema::table('dogadjaji', function (Blueprint $table) {
            $table->boolean('ponavljajuci')->default(false)->after('status');

            // dnevno | nedeljno | mesecno | godisnje
            $table->string('period_ponavljanja')->nullable()->after('ponavljajuci');

            // do kog datuma se ponavlja
            $table->dateTime('ponavlja_se_do')->nullable()->after('period_ponavljanja');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dogadjaji', function (Blueprint $table) {
            //
        });
    }
};
