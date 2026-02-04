<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Statistika extends Model
{
    protected $table = 'statistike';

    protected $fillable = [
        'admin_id',
        'tip',        // npr. 'zauzetost_sala', 'broj_sastanaka'
        'podaci',     // JSON
        'kreirano_u',
    ];

    protected $casts = [
        'podaci' => 'array',
        'kreirano_u' => 'datetime',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}

