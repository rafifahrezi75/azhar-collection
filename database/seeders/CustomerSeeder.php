<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('customers')->delete(); // Fresh start

        $customers = [
            [
                'code' => 'CUST-001',
                'name' => 'SD Negeri 1 Sumber',
                'phone' => '081234567801',
                'address' => 'Jl. Pendidikan No. 1, Sumber, Cirebon',
                'type' => 'Sekolah',
                'notes' => 'Langganan tetap seragam SD',
            ],
            [
                'code' => 'CUST-002',
                'name' => 'SMP IT Bina Ummah',
                'phone' => '082133445566',
                'address' => 'Jl. Pesantren No. 4, Kedawung, Cirebon',
                'type' => 'Sekolah',
                'notes' => 'Grosir seragam olahraga dan pramuka',
            ],
            [
                'code' => 'CUST-003',
                'name' => 'SMA Negeri 2 Cirebon',
                'phone' => '081987654321',
                'address' => 'Jl. Cipto Mangunkusumo, Cirebon',
                'type' => 'Sekolah',
                'notes' => 'Seragam OSIS dan Batik',
            ],
            [
                'code' => 'CUST-004',
                'name' => 'Pesantren Darussalam',
                'phone' => '085299887766',
                'address' => 'Kuningan',
                'type' => 'Institusi',
                'notes' => 'Langganan baju koko dan gamis',
            ],
            [
                'code' => 'CUST-005',
                'name' => 'Toko Pakaian Barokah',
                'phone' => '081122334455',
                'address' => 'Pasar Tegal Gubug, Blok A No. 12',
                'type' => 'Agen/Reseller',
                'notes' => 'Grosir celana sirwal dan gamis',
            ]
        ];

        foreach ($customers as $data) {
            Customer::create($data);
        }
    }
}
