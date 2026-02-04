<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Sastanak extends Model
{
    protected $table = 'sastanci';

    protected $fillable = [
        'naziv',
        'pocetak',
        'kraj',
        'lokacija',
        'sala_id',    // može biti null
        'kreirao_id', // tim lider ili admin
    ];

    protected $casts = [
        'pocetak' => 'datetime',
        'kraj' => 'datetime',
    ];

    public function sala(): BelongsTo
    {
        return $this->belongsTo(Sala::class, 'sala_id');
    }

    public function kreator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'kreirao_id');
    }

    public function ucesnici(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'ucesnici_sastanka', 'sastanak_id', 'korisnik_id');
    }
}
