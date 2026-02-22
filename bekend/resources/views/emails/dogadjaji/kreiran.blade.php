@component('mail::message')
# Novi događaj je dodat

**Kalendar:** {{ $kalendar->naziv ?? ('#' . $kalendar->id) }}

**Naziv:** {{ $dogadjaj->naziv }}
@if($dogadjaj->lokacija)
**Lokacija:** {{ $dogadjaj->lokacija }}
@endif

**Početak:** {{ \Carbon\Carbon::parse($dogadjaj->pocetak)->format('d.m.Y. H:i') }}
**Kraj:** {{ \Carbon\Carbon::parse($dogadjaj->kraj)->format('d.m.Y. H:i') }}

@if($dogadjaj->ceo_dan)
**Napomena:** Ceo dan
@endif

@if($dogadjaj->opis)
---

{{ $dogadjaj->opis }}
@endif

Pozdrav,  
{{ config('app.name') }}
@endcomponent