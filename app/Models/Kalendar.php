<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Kalendar extends Model
{
    protected $table = 'kalendari';

    protected $fillable = [
        'korisnik_id',
        'naziv',
    ];

    public function korisnik(): BelongsTo
    {
        return $this->belongsTo(User::class, 'korisnik_id');
    }
}

