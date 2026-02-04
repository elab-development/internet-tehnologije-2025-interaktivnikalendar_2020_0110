<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Istorija extends Model
{
    protected $table = 'istorija';

    protected $fillable = [
        'korisnik_id',
        'tip',        // 'sastanak' ili 'task'
        'aktivnost_id',
        'status',     // npr. 'odrzan', 'otkazan', 'zavrsen'
        'zatvoreno_u',
    ];

    protected $casts = [
        'zatvoreno_u' => 'datetime',
    ];

    public function korisnik(): BelongsTo
    {
        return $this->belongsTo(User::class, 'korisnik_id');
    }
}
