<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SizeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Dewasa' => ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
            'Anak-anak' => ['2', '4', '6', '8', '10', '12'],
            'SD' => ['S', 'M', 'L', 'XL', 'XXL'],
            'SMP' => ['S', 'M', 'L', 'XL', 'XXL'],
            'SMA' => ['S', 'M', 'L', 'XL', 'XXL'],
            'Celana' => ['28', '30', '32', '34', '36', '38'],
        ];

        foreach ($categories as $category => $sizes) {
            foreach ($sizes as $size) {
                \App\Models\Size::create([
                    'category' => $category,
                    'size_name' => $size,
                ]);
            }
        }
    }
}
