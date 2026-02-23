<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kalendar;
use App\Models\Dogadjaj;
use App\Models\Notifikacija;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DogadjajTest extends TestCase
{
    use RefreshDatabase;

    private function createUserAndCalendar()
    {
        $user = User::create([
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => Hash::make('123456'),
            'uloga' => 'zaposleni',
        ]);

        $kalendar = Kalendar::create([
            'naziv' => 'Test kalendar',
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        return [$user, $kalendar];
    }

    public function test_index_returns_only_user_events()
    {
        [$user, $kalendar] = $this->createUserAndCalendar();

        Dogadjaj::create([
            'kalendar_id' => $kalendar->id,
            'naziv' => 'Event',
            'pocetak' => now(),
            'kraj' => now()->addHour(),
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dogadjaji');

        $res->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_store_creates_event_and_notification()
    {
        Mail::fake();

        [$user, $kalendar] = $this->createUserAndCalendar();

        $payload = [
            'kalendar_id' => $kalendar->id,
            'naziv' => 'Sastanak',
            'pocetak' => now()->toDateTimeString(),
            'kraj' => now()->addHour()->toDateTimeString(),
        ];

        $res = $this->actingAs($user, 'sanctum')
            ->postJson('/api/dogadjaji', $payload);

        $res->assertStatus(201)
            ->assertJsonStructure(['message', 'data']);

        $this->assertDatabaseHas('dogadjaji', [
            'naziv' => 'Sastanak'
        ]);

        $this->assertDatabaseHas('notifikacije', [
            'status' => 'poslato'
        ]);
    }

    public function test_store_fails_if_kraj_before_pocetak()
    {
        [$user, $kalendar] = $this->createUserAndCalendar();

        $payload = [
            'kalendar_id' => $kalendar->id,
            'naziv' => 'Lose vreme',
            'pocetak' => now()->toDateTimeString(),
            'kraj' => now()->subHour()->toDateTimeString(),
        ];

        $res = $this->actingAs($user, 'sanctum')
            ->postJson('/api/dogadjaji', $payload);

        $res->assertStatus(422)
            ->assertJsonStructure(['errors' => ['kraj']]);
    }

    public function test_show_returns_event()
    {
        [$user, $kalendar] = $this->createUserAndCalendar();

        $dogadjaj = Dogadjaj::create([
            'kalendar_id' => $kalendar->id,
            'naziv' => 'Event',
            'pocetak' => now(),
            'kraj' => now()->addHour(),
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->getJson("/api/dogadjaji/{$dogadjaj->id}");

        $res->assertStatus(200)
            ->assertJsonPath('data.id', $dogadjaj->id);
    }

    public function test_update_updates_event()
    {
        [$user, $kalendar] = $this->createUserAndCalendar();

        $dogadjaj = Dogadjaj::create([
            'kalendar_id' => $kalendar->id,
            'naziv' => 'Old',
            'pocetak' => now(),
            'kraj' => now()->addHour(),
        ]);

        $payload = [
            'kalendar_id' => $kalendar->id,
            'naziv' => 'New',
            'pocetak' => now()->toDateTimeString(),
            'kraj' => now()->addHours(2)->toDateTimeString(),
        ];

        $res = $this->actingAs($user, 'sanctum')
            ->putJson("/api/dogadjaji/{$dogadjaj->id}", $payload);

        $res->assertStatus(200);

        $this->assertDatabaseHas('dogadjaji', [
            'id' => $dogadjaj->id,
            'naziv' => 'New'
        ]);
    }

    public function test_delete_removes_event()
    {
        [$user, $kalendar] = $this->createUserAndCalendar();

        $dogadjaj = Dogadjaj::create([
            'kalendar_id' => $kalendar->id,
            'naziv' => 'Delete me',
            'pocetak' => now(),
            'kraj' => now()->addHour(),
        ]);

        $res = $this->actingAs($user, 'sanctum')
            ->deleteJson("/api/dogadjaji/{$dogadjaj->id}");

        $res->assertStatus(200);

        $this->assertDatabaseMissing('dogadjaji', [
            'id' => $dogadjaj->id
        ]);
    }
}