<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MenuUpdateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Menu ordering is now handled directly in AccessSeeder.
     * This seeder cleans up any leftover duplicate entries.
     */
    public function run(): void
    {
        // Remove duplicate "Master Ukuran" if "Ukuran" already exists
        $p = \App\Models\Menu::where('title', 'Master Data')->first();
        if ($p) {
            $hasUkuran = \App\Models\Menu::where('title', 'Ukuran')->where('parent_id', $p->id)->exists();
            if ($hasUkuran) {
                \App\Models\Menu::where('title', 'Master Ukuran')->where('parent_id', $p->id)->delete();
            }
        }
    }
}
