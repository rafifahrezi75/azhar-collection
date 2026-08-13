<?php

namespace Database\Seeders;

use App\Models\ProductionStep;
use Illuminate\Database\Seeder;

class ProductionStepSeeder extends Seeder
{
    public function run(): void
    {
        $steps = [
            ['name' => 'Potong Kain (Cutting)', 'default_wage' => 1500, 'description' => 'Memotong kain berdasarkan pola marker'],
            ['name' => 'Jahit Obras', 'default_wage' => 2000, 'description' => 'Mengobras pinggiran kain agar tidak berserabut'],
            ['name' => 'Jahit Lurus (Assembling)', 'default_wage' => 5000, 'description' => 'Menjahit menggabungkan potongan badan dan lengan'],
            ['name' => 'Pasang Kerah & Manset', 'default_wage' => 3000, 'description' => 'Pemasangan kerah kemeja dan lengan manset'],
            ['name' => 'Sum / Jahit Lipat Bawah', 'default_wage' => 1500, 'description' => 'Jahit kelim bagian bawah kemeja/celana'],
            ['name' => 'Lubang Kancing', 'default_wage' => 800, 'description' => 'Membuat lubang kancing dengan mesin khusus'],
            ['name' => 'Pasang Kancing', 'default_wage' => 700, 'description' => 'Menjahit kancing kemeja'],
            ['name' => 'Gosok / Setrika (Ironing)', 'default_wage' => 1000, 'description' => 'Finishing gosok uap agar rapi'],
            ['name' => 'Lipat & Packing', 'default_wage' => 500, 'description' => 'Melipat baju dan memasukkan ke dalam plastik kemasan'],
            ['name' => 'Bordir Dada', 'default_wage' => 4500, 'description' => 'Bordir logo atau motif di bagian dada'],
            ['name' => 'Pasang Resleting / Zipper', 'default_wage' => 2500, 'description' => 'Pemasangan zipper pada celana atau gamis'],
        ];

        foreach ($steps as $step) {
            ProductionStep::firstOrCreate(
                ['name' => $step['name']],
                $step
            );
        }
    }
}
