<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kalendar extends Model
{
    protected $table = 'kalendari';
       protected $fillable = [
        'user_id',
        'naziv',
    ];
    public function korisnik()
    {
        return $this->belongsTo(User::class, 'user_id');
    }


    public function dogadjaji()
    {
        return $this->hasMany(Dogadjaj::class, 'kalendar_id');
    }

}
