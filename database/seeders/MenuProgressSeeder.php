<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuProgressSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure Progress Penjahit menu exists with the canonical order (3)
        $menu = Menu::where('path', '/dashboard/production-progress')->first();

        if ($menu) {
            $menu->update(['sort_order' => 3, 'is_active' => true]);

            return;
        }

        Menu::create([
            'parent_id' => null,
            'title' => 'Progress Penjahit',
            'icon' => 'Scissors',
            'path' => '/dashboard/production-progress',
            'permission_name' => null,
            'sort_order' => 3,
            'is_active' => true,
        ]);
    }
}
