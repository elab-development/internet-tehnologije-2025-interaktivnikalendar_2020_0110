<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_success()
    {
        $payload = [
            'name' => 'Marko Markovic',
            'email' => 'marko_new@test.com',
            'password' => '123456',
            'password_confirmation' => '123456',
            'uloga' => 'zaposleni',
        ];

        $res = $this->postJson('/api/register', $payload);

        $res->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'uloga', 'created_at', 'updated_at'],
                'token',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'marko_new@test.com',
            'uloga' => 'zaposleni',
        ]);
    }

    public function test_register_validation_fails_when_email_missing()
    {
        $payload = [
            'name' => 'Marko',
            'password' => '123456',
            'password_confirmation' => '123456',
            'uloga' => 'zaposleni',
        ];

        $res = $this->postJson('/api/register', $payload);

        $res->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => ['email'],
            ]);
    }

    public function test_register_validation_fails_when_password_not_confirmed()
    {
        $payload = [
            'name' => 'Marko',
            'email' => 'marko@test.com',
            'password' => '123456',
            'password_confirmation' => 'xxxxxx',
            'uloga' => 'zaposleni',
        ];

        $res = $this->postJson('/api/register', $payload);

        $res->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => ['password'],
            ]);
    }

    public function test_register_validation_fails_when_uloga_invalid()
    {
        $payload = [
            'name' => 'Marko',
            'email' => 'marko@test.com',
            'password' => '123456',
            'password_confirmation' => '123456',
            'uloga' => 'neka_uloga',
        ];

        $res = $this->postJson('/api/register', $payload);

        $res->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => ['uloga'],
            ]);
    }

    public function test_login_success()
    {
        User::create([
            'name' => 'Marko',
            'email' => 'marko@test.com',
            'password' => Hash::make('123456'),
            'uloga' => 'zaposleni',
        ]);

        $res = $this->postJson('/api/login', [
            'email' => 'marko@test.com',
            'password' => '123456',
        ]);

        $res->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'uloga', 'created_at', 'updated_at'],
                'token',
            ]);
    }

    public function test_login_fails_with_wrong_password()
    {
        User::create([
            'name' => 'Marko',
            'email' => 'marko@test.com',
            'password' => Hash::make('123456'),
            'uloga' => 'zaposleni',
        ]);

        $res = $this->postJson('/api/login', [
            'email' => 'marko@test.com',
            'password' => 'pogresno',
        ]);

        $res->assertStatus(401)
            ->assertJson([
                'message' => 'Pogrešan email ili lozinka.'
            ]);
    }

    public function test_login_validation_fails()
    {
        $res = $this->postJson('/api/login', [
            'email' => 'nije_email',
            'password' => '',
        ]);

        $res->assertStatus(422)
            ->assertJsonStructure([
                'message',
                'errors' => ['email', 'password'],
            ]);
    }
}