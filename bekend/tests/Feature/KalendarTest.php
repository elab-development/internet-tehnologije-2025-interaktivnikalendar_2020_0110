<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kalendar;
use App\Models\Dogadjaj;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class KalendarTest extends TestCase
{
    use RefreshDatabase;

    private function createUser()
    {
        return User::create([
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => Hash::make('123456'),
            'uloga' => 'zaposleni',
        ]);
    }

    public function test_index_returns_message_when_user_has_no_calendars()
    {
        $user = $this->createUser();

        $res = $this->actingAs($user, 'sanctum')
            ->getJson('/api/kalendari');

        $res->assertStatus(200)
            ->assertJson([
                'message' => 'Nema kalendara za ovog korisnika.',
                'data' => [],
            ]);
    }

    public function test_index_returns_only_user_calendars()
    {
        $user1 = $this->createUser();

        $user2 = User::create([
            'name' => 'Other',
            'email' => 'other@test.com',
            'password' => Hash::make('123456'),
            'uloga' => 'zaposleni',
        ]);

        Kalendar::create(['user_id' => $user1->id, 'naziv' => 'Moj 1']);
        Kalendar::create(['user_id' => $user1->id, 'naziv' => 'Moj 2']);
        Kalendar::create(['user_id' => $user2->id, 'naziv' => 'Tudji']);

        $res = $this->actingAs($user1, 'sanctum')
            ->getJson('/api/kalendari');

        $res->assertStatus(200)
            ->assertJsonStructure(['data'])
            ->assertJsonCount(2, 'data');

        $names = array_map(fn($x) => $x['naziv'], $res->json('data'));
        $this->assertContains('Moj 1', $names);
        $this->assertContains('Moj 2', $names);
        $this->assertNotContains('Tudji', $names);
    }

    public function test_store_creates_calendar()
    {
        $user = $this->createUser();

        $res = $this->actingAs($user, 'sanctum')
            ->postJson('/api/kalendari', [
                'naziv' => 'Novi kalendar',
            ]);

        $res->assertStatus(201)
            ->assertJsonStructure(['message', 'data' => ['id', 'user_id', 'naziv']]);

        $this->assertDatabaseHas('kalendari', [
            'user_id' => $user->id,
            'naziv' => 'Novi kalendar',
        ]);
    }

    public function test_store_validation_fails_when_naziv_missing()
    {
        $user = $this->createUser();

        $res = $this->actingAs($user, 'sanctum')
            ->postJson('/api/kalendari', []);

        $res->assertStatus(422)
            ->assertJsonStructure(['message', 'errors' => ['naziv']]);
    }

    public function test_update_returns_404_when_calendar_not_found()
    {
        $user = $this->createUser();

        $res = $this->actingAs($user, 'sanctum')
            ->putJson('/api/kalendari/999999', [
                'naziv' => 'X',
            ]);

        $res->assertStatus(404)
            ->assertJson(['message' => 'Kalendar nije pronađen.']);
    }

    public function test_update_updates_calendar()
    {
        $user = $this->createUser();

        $k = Kalendar::create([
            'user_id' => $user->id,
            'naziv' => 'Stari naziv',
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->putJson("/api/kalendari/{$k->id}", [
                'naziv' => 'Novi naziv',
            ]);

        $res->assertStatus(200)
            ->assertJsonStructure(['message', 'data' => ['id', 'naziv']]);

        $this->assertDatabaseHas('kalendari', [
            'id' => $k->id,
            'naziv' => 'Novi naziv',
        ]);
    }

    public function test_update_validation_fails_when_naziv_missing()
    {
        $user = $this->createUser();

        $k = Kalendar::create([
            'user_id' => $user->id,
            'naziv' => 'Stari naziv',
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->putJson("/api/kalendari/{$k->id}", []);

        $res->assertStatus(422)
            ->assertJsonStructure(['message', 'errors' => ['naziv']]);
    }

    public function test_destroy_deletes_calendar()
    {
        $user = $this->createUser();

        $k = Kalendar::create([
            'user_id' => $user->id,
            'naziv' => 'Za brisanje',
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/kalendari/{$k->id}");

        $res->assertStatus(200)
            ->assertJson(['message' => 'Kalendar je uspešno obrisan.']);

        $this->assertDatabaseMissing('kalendari', [
            'id' => $k->id,
        ]);
    }

    public function test_destroy_returns_404_when_calendar_not_found()
    {
        $user = $this->createUser();

        $res = $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/kalendari/999999');

        $res->assertStatus(404)
            ->assertJson(['message' => 'Kalendar nije pronađen.']);
    }

    public function test_dogadjaji_returns_404_when_calendar_not_found()
    {
        $user = $this->createUser();

        $res = $this->actingAs($user, 'sanctum')
            ->getJson('/api/kalendari/999999/dogadjaji');

        $res->assertStatus(404)
            ->assertJson(['message' => 'Kalendar nije pronađen.']);
    }

    public function test_dogadjaji_returns_message_when_no_events()
    {
        $user = $this->createUser();

        $k = Kalendar::create([
            'user_id' => $user->id,
            'naziv' => 'K1',
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->getJson("/api/kalendari/{$k->id}/dogadjaji");

        $res->assertStatus(200)
            ->assertJson([
                'message' => 'Nema događaja za ovaj kalendar.',
                'data' => [],
            ]);
    }

    public function test_dogadjaji_returns_events_sorted_by_pocetak()
    {
        $user = $this->createUser();

        $k = Kalendar::create([
            'user_id' => $user->id,
            'naziv' => 'K1',
        ]);

        $e2 = Dogadjaj::create([
            'kalendar_id' => $k->id,
            'naziv' => 'Kasnije',
            'pocetak' => now()->addDays(2),
            'kraj' => now()->addDays(2)->addHour(),
        ]);

        $e1 = Dogadjaj::create([
            'kalendar_id' => $k->id,
            'naziv' => 'Ranije',
            'pocetak' => now()->addDay(),
            'kraj' => now()->addDay()->addHour(),
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->getJson("/api/kalendari/{$k->id}/dogadjaji");

        $res->assertStatus(200)
            ->assertJsonStructure(['data'])
            ->assertJsonCount(2, 'data');

        $data = $res->json('data');
        $this->assertEquals($e1->id, $data[0]['id']);
        $this->assertEquals($e2->id, $data[1]['id']);
    }
}