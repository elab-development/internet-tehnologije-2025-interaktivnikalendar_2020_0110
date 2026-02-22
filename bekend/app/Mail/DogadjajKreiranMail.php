<?php

namespace App\Mail;

use App\Models\Dogadjaj;
use App\Models\Kalendar;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DogadjajKreiranMail extends Mailable
{
    use Queueable, SerializesModels;

    public Dogadjaj $dogadjaj;
    public Kalendar $kalendar;

    public function __construct(Dogadjaj $dogadjaj, Kalendar $kalendar)
    {
        $this->dogadjaj = $dogadjaj;
        $this->kalendar = $kalendar;
    }

    public function build()
    {
        return $this
            ->subject('Dodat je novi događaj u kalendar')
            ->markdown('emails.dogadjaji.kreiran');
    }
}