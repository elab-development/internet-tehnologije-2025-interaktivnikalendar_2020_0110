# Interaktivni Kalendar — Internet Tehnologije (Laravel + React)

Ovaj projekat je razvijen kao studentska aplikacija za predmet **Internet Tehnologije**. 
Aplikacija predstavlja web platformu za kreiranje i upravljanje kalendarima i događajima, sa podrškom za više korisničkih uloga i administraciju sistema.

## Kratak opis aplikacije

Aplikacija omogućava korisnicima da:
- registruju nalog i prijave se u sistem
- kreiraju više kalendara i upravljaju njima
- upravljanje događajima u kalendaru
- koriste prikaz kalendara po **mesecu** ili **nedelji**
- eksportuju događaje u **.ics** format (Calendar export)

Dodatno, aplikacija sadrži admin panel koji omogućava:
- pregled osnovnih statistika sistema  
- pregled notifikacija po statusu  
- upravljanje korisnicima  
- dodelu događaja korisniku 

## Tehnologije

- Backend: Laravel (REST API)
- Frontend: React (SPA) + react-router-dom
- Baza: MySQL
- Deploy: Docker / Docker Compose (lokalno), Railway (produkcija)

 
 

## Pokretanje aplikacije (Docker)

Aplikacija se pokreće iz Dockera. U root direktorijumu projekta pokrenuti:

1) Build i start servisa:
docker compose up --build

2) (Preporučeno) pokretanje migracija i seedera (u backend container-u):
docker compose exec backend php artisan migrate 
docker compose exec backend php artisan db:seed

   
## Produkciona verzija aplikacije
Aplikacija je postavljena na produkciono okruženje i dostupna je na sledećem linku:

[Pokreni aplikaciju](https://bountiful-elegance-production-6662.up.railway.app/)


## Testiranje aplikacije
Implementiran je CI/CD pipeline pomoću GitHub Actions.
Na svaki push i pull request automatski se pokreću backend testovi, vrši se instalacija dependencija, migracije baze i pokreće PHPUnit test suite.
Ako testovi prođu, pipeline automatski gradi Docker image aplikacije i objavljuje ga u GitHub Container Registry.
Time je obezbeđena automatizovana provera kvaliteta i kontinuirana isporuka aplikacije.