<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TailorSeeder extends Seeder
{
    public function run(): void
    {
        $staffRole = Role::where('name', 'staff')->first();

        $tailors = [
            ['name' => 'Ahmad Fauzi', 'email' => 'ahmad@azhar.test'],
            ['name' => 'Agus Setiawan', 'email' => 'agus@azhar.test'],
            ['name' => 'Budi Santoso', 'email' => 'budi@azhar.test'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@azhar.test'],
            ['name' => 'Siti Rahayu', 'email' => 'siti@azhar.test'],
            ['name' => 'Rudi Hartono', 'email' => 'rudi@azhar.test'],
            ['name' => 'Eka Putri', 'email' => 'eka@azhar.test'],
            ['name' => 'Joko Prasetyo', 'email' => 'joko@azhar.test'],
        ];

        foreach ($tailors as $t) {
            $user = User::updateOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );

            if ($staffRole) {
                $user->roles()->syncWithoutDetaching([$staffRole->id]);
            }
        }
    }
}
