<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikacija extends Model
{
        protected $fillable = [
            'user_id',
            'dogadjaj_id',
            'kanal',        // email
            'poslati_u',
            'poslato_u',
            'status',       // na_cekanju | poslato | greska
            'greska',
    ];


        protected $casts = [
            'poslati_u' => 'datetime',
            'poslato_u' => 'datetime',
        ];

        public function korisnik()
        {
            return $this->belongsTo(User::class, 'user_id');
        }

        public function dogadjaj()
        {
            return $this->belongsTo(Dogadjaj::class, 'dogadjaj_id');
        }
}
