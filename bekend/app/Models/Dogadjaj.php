<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dogadjaj extends Model
{
    protected $fillable = [
        'kalendar_id',
        'naziv',
        'opis',
        'pocetak',  //timestamp 
        'kraj',
        'lokacija',  
        'ceo_dan',
        'status',


        'ponavljajuci',
        'period_ponavljanja',   // dnevno | nedeljno | mesecno | godisnje
        'ponavlja_se_do',
 
    ];
    protected $casts = [
        'pocetak' => 'datetime',
        'kraj' => 'datetime',
        'ceo_dan' => 'boolean',
        'ponavljajuci' => 'boolean',
        'ponavlja_se_do' => 'datetime',
    ];



    public function kalendar()
    {
        return $this->belongsTo(Kalendar::class, 'kalendar_id');
    }

    public function notifikacije()
    {
         return $this->hasMany(Notifikacija::class, 'dogadjaj_id');
    }


    //TODO ucescnici 

 
}
