<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sala extends Model
{
    protected $table = 'sale';

    protected $fillable = [
        'naziv',
        'kapacitet',
        'aktivna',
    ];

    protected $casts = [
        'kapacitet' => 'integer',
        'aktivna' => 'boolean',
    ];

    public function sastanci(): HasMany
    {
        return $this->hasMany(Sastanak::class, 'sala_id');
    }
}

