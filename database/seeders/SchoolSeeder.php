<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            [
                'code' => 'SCH-001',
                'name' => 'SMA Negeri 1 Jakarta',
                'level' => 'SMA',
                'contact_person' => 'Drs. H. Bambang Sutrisno, M.Pd (Kepala Sekolah)',
                'phone' => '0812-3456-7890',
                'email' => 'info@sman1jakarta.sch.id',
                'address' => 'Jl. Budi Utomo No.7, Ps. Baru, Sawah Besar, Jakarta Pusat',
                'notes' => 'Pesanan rutin seragam putih abu-abu, batik sekolah khusus, dan jas almamater angkatan.',
                'is_active' => true,
            ],
            [
                'code' => 'SCH-002',
                'name' => 'SMP Negeri 2 Bandung',
                'level' => 'SMP',
                'contact_person' => 'Ibu Siti Nurhaliza, S.Pd (Koordinator Koperasi/Seragam)',
                'phone' => '0821-9876-5432',
                'email' => 'koperasi@smpn2bandung.sch.id',
                'address' => 'Jl. Sumatera No.42, Merdeka, Kec. Sumur Bandung, Kota Bandung',
                'notes' => 'Pemesanan seragam putih biru, seragam pramuka lengkap, dan kaos olahraga katun combed.',
                'is_active' => true,
            ],
            [
                'code' => 'SCH-003',
                'name' => 'SD Islam Al-Azhar 1',
                'level' => 'SD',
                'contact_person' => 'Ust. Muhammad Rasyid (PIC Sarpras & Pengadaan)',
                'phone' => '0813-1122-3344',
                'email' => 'pengadaan@al-azhar1.sch.id',
                'address' => 'Jl. Sisingamangaraja, Kebayoran Baru, Jakarta Selatan',
                'notes' => 'Kain Toyobo & Katun Oxford untuk kemeja muslim, rok/celana bahan Drill hijau botol.',
                'is_active' => true,
            ],
            [
                'code' => 'SCH-004',
                'name' => 'SMK Telkom Malang',
                'level' => 'SMK',
                'contact_person' => 'Bpk. Hendra Gunawan, S.Kom (Waka Kesiswaan)',
                'phone' => '0857-8899-0011',
                'email' => 'kesiswaan@smktelkom-mlg.sch.id',
                'address' => 'Jl. Danau Ranau, Sawojajar, Kedungkandang, Kota Malang',
                'notes' => 'Seragam praktek bengkel IT/Wearpack, kemeja putih drill, dasi bordir komputer.',
                'is_active' => true,
            ],
            [
                'code' => 'SCH-005',
                'name' => 'Pondok Pesantren Darussalam',
                'level' => 'Pesantren',
                'contact_person' => 'K.H. Ahmad Syamsuddin (Bagian Pengadaan Pondok)',
                'phone' => '0819-7766-5544',
                'email' => 'sekretariat@darussalam.ac.id',
                'address' => 'Jl. Pondok Gontor Barat No.12, Ponorogo, Jawa Timur',
                'notes' => 'Pemesanan koko santri, gamis santriwati, jilbab segi empat, dan sarung seragam.',
                'is_active' => true,
            ],
            [
                'code' => 'SCH-006',
                'name' => 'Yayasan Pendidikan Budi Luhur',
                'level' => 'Yayasan',
                'contact_person' => 'Ibu Dra. Hj. Ratna Dewi (Ketua Yayasan)',
                'phone' => '0812-8877-6655',
                'email' => 'yayasan@budiluhur.org',
                'address' => 'Jl. Ciledug Raya, Petukangan Utara, Pesanggrahan, Jakarta Selatan',
                'notes' => 'Paket seragam grup TK, SD, SMP, SMA naungan yayasan.',
                'is_active' => true,
            ],
        ];

        foreach ($schools as $school) {
            School::updateOrCreate(
                ['code' => $school['code']],
                $school
            );
        }
    }
}
