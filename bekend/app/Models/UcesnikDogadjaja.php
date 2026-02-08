<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UcesnikDogadjaja extends Model
{
        protected $fillable = [
            'dogadjaj_id',
            'user_id',
            'status',          // pozvan | prihvatio | odbio
            'notifikovan_u',
        ];
        protected $casts = [
            'notifikovan_u' => 'datetime',
        ];

        public function dogadjaj()
        {
            return $this->belongsTo(Dogadjaj::class, 'dogadjaj_id');
        }

        public function korisnik()
        {
            return $this->belongsTo(User::class, 'user_id');
        }

}
