<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    protected $fillable = [
        'ime',
        'prezime',
        'email',
        'password',
        'uloga', // 'zaposleni' | 'tim_lider' | 'admin'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function kalendari(): HasMany
    {
        return $this->hasMany(Kalendar::class, 'korisnik_id');
    }

    public function sastanciKreirani(): HasMany
    {
        return $this->hasMany(Sastanak::class, 'kreirao_id');
    }

    public function istorija(): HasMany
    {
        return $this->hasMany(Istorija::class, 'korisnik_id');
    }

    public function sastanci(): BelongsToMany
    {
        return $this->belongsToMany(Sastanak::class, 'ucesnici_sastanka', 'korisnik_id', 'sastanak_id');
    }
}
