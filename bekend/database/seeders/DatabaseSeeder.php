<?php

namespace Database\Seeders;

use App\Models\User; 
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('notifikacije')->truncate();
        DB::table('ucesnici_dogadjaja')->truncate();
        DB::table('dogadjaji')->truncate();
        DB::table('kalendari')->truncate();
        DB::table('users')->truncate();
        Schema::enableForeignKeyConstraints();


          DB::table('users')->insert([
            [
                'name' => 'Admin',
                'email' => 'admin@test.com',
                'password' => Hash::make('123456'),
                'uloga' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Marko',
                'email' => 'marko@test.com',
                'password' => Hash::make('123456'),
                'uloga' => 'zaposleni',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Jovana',
                'email' => 'jovana@test.com',
                'password' => Hash::make('123456'),
                'uloga' => 'zaposleni',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
         DB::table('kalendari')->insert([
            [
                'user_id' => 1,
                'naziv' => 'Admin kalendar',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'naziv' => 'Marko kalendar',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
        DB::table('dogadjaji')->insert([
            [
                'kalendar_id' => 1,
                'naziv' => 'Team meeting',
                'lokacija' => 'Sala 1',
                'pocetak' => now()->addDay(),
                'kraj' => now()->addDay()->addHour(),
                'ceo_dan' => false,
                'status' => 'planirano',

                'ponavljajuci' => false,
                'period_ponavljanja' => null,
                'ponavlja_se_do' => null,

              

                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'kalendar_id' => 2,
                'naziv' => 'Daily standup',
                'lokacija' => 'Online',
                'pocetak' => now()->addDay(),
                'kraj' => now()->addDay()->addMinutes(30),
                'ceo_dan' => false,
                'status' => 'planirano',

                'ponavljajuci' => true,
                'period_ponavljanja' => 'daily',
                'ponavlja_se_do' => now()->addDays(7), 

                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);


        DB::table('ucesnici_dogadjaja')->insert([
            [
                'dogadjaj_id' => 1,
                'user_id' => 2,
                'status' => 'pozvan',
                'notifikovan_u' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'dogadjaj_id' => 1,
                'user_id' => 3,
                'status' => 'pozvan',
                'notifikovan_u' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
        DB::table('notifikacije')->insert([
            [
                'user_id' => 2,
                'dogadjaj_id' => 1,
                'text' => 'Podsetnik za dogadjaj: Team meeting',
                'kanal' => 'email',
                'poslati_u' => now()->addMinutes(1),
                'poslato_u' => null,
                'status' => 'na_cekanju',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 3,
                'dogadjaj_id' => 1,
                'text' => 'Podsetnik za dogadjaj: Team meeting',
                'kanal' => 'email',
                'poslati_u' => now()->addMinutes(1),
                'poslato_u' => null,
                'status' => 'na_cekanju',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);


    }
}
