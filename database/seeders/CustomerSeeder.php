<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('customers')->delete();

        $customers = [
            [
                'code' => 'CUST-001',
                'name' => 'SD Negeri 1 Sumber',
                'phone' => '081234567801',
                'address' => 'Jl. Pendidikan No. 1, Sumber, Cirebon',
                'type' => 'Sekolah',
                'notes' => 'Langganan tetap seragam SD merah putih dan pramuka',
            ],
            [
                'code' => 'CUST-002',
                'name' => 'SMP Negeri 1 Cirebon',
                'phone' => '082133445566',
                'address' => 'Jl. Siliwangi No. 25, Kota Cirebon',
                'type' => 'Sekolah',
                'notes' => 'Pemesanan seragam OSIS biru putih dan batik',
            ],
            [
                'code' => 'CUST-003',
                'name' => 'SMA Negeri 2 Cirebon',
                'phone' => '081987654321',
                'address' => 'Jl. Cipto Mangunkusumo No. 10, Kota Cirebon',
                'type' => 'Sekolah',
                'notes' => 'Pemesanan seragam abu-abu dan seragam pramuka penegak',
            ],
            [
                'code' => 'CUST-004',
                'name' => 'Toko Seragam Barokah',
                'phone' => '081122334455',
                'address' => 'Pasar Tegal Gubug, Blok A No. 12, Arjawinangun',
                'type' => 'Agen/Reseller',
                'notes' => 'Grosir celana panjang dan kemeja polos',
            ],
        ];

        foreach ($customers as $data) {
            Customer::create($data);
        }
    }
}
