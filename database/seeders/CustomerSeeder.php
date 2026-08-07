<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'code' => 'CUST-001',
                'name' => 'SMA Negeri 1 Jakarta',
                'type' => 'Sekolah',
                'institution_name' => 'SMAN 1 Jakarta',
                'contact_person' => 'Drs. H. Bambang Sutrisno, M.Pd (Kepala Sekolah)',
                'phone' => '0812-3456-7890',
                'email' => 'info@sman1jakarta.sch.id',
                'address' => 'Jl. Budi Utomo No.7, Ps. Baru, Sawah Besar, Jakarta Pusat',
                'notes' => 'Pesanan rutin seragam putih abu-abu, batik sekolah khusus, dan jas almamater angkatan.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-002',
                'name' => 'Dinas Pendidikan & Kebudayaan Provinsi Jawa Barat',
                'type' => 'Instansi / Pemerintah',
                'institution_name' => 'Disdik Jabar',
                'contact_person' => 'Bpk. Ridwan Setiawan, S.STP (Kasubag Pengadaan)',
                'phone' => '0813-2233-4455',
                'email' => 'pengadaan@disdik.jabarprov.go.id',
                'address' => 'Jl. Dr. Rajiman No.6, Pasir Kaliki, Kec. Cicendo, Kota Bandung',
                'notes' => 'Pemesanan kemeja dinas PDH harian, seragam Korpri katun premium, dan rompi lapangan berlogo bordir dinas.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-003',
                'name' => 'PT Astra Honda Motor (Plant Sunter)',
                'type' => 'Perusahaan / Swasta',
                'institution_name' => 'PT Astra Honda Motor',
                'contact_person' => 'Ibu Ratna Kumalasari (General Affairs / Procurement)',
                'phone' => '0811-9876-1234',
                'email' => 'procurement.ga@astra-honda.com',
                'address' => 'Kawasan Industri Jl. Laksda Yos Sudarso, Sunter I, Jakarta Utara',
                'notes' => 'Produksi rutin wearpack bengkel teknisi bahan American Drill, polo shirt seragam harian bordir komputer, dan jaket touring event.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-004',
                'name' => 'Komunitas Sepeda Gowes Bandung Raya',
                'type' => 'Komunitas / Organisasi',
                'institution_name' => 'Komunitas Gowes Bandung',
                'contact_person' => 'Kang Asep Sudrajat (Koordinator Jersey & Perlengkapan)',
                'phone' => '0857-2233-8899',
                'email' => 'gowes.bandung@gmail.com',
                'address' => 'Jl. R.E. Martadinata No.112, Cihapit, Bandung Wetan, Kota Bandung',
                'notes' => 'Pemesanan jersey sepeda full sublim bahan dryfit milano, resleting depan tersembunyi, dan saku belakang 3 kompartemen.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-005',
                'name' => 'Bpk. Hendra Gunawan',
                'type' => 'Perorangan',
                'institution_name' => 'Personal / Pribadi',
                'contact_person' => 'Bpk. Hendra Gunawan',
                'phone' => '0818-0912-3456',
                'email' => 'hendra.gunawan@yahoo.com',
                'address' => 'Jl. Buah Batu No.88, Cijagra, Kec. Lengkong, Kota Bandung',
                'notes' => 'Pesanan kemeja batik tulis sutra furing hero dan 2 set jas formal pesta custom fit ukuran badan.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-006',
                'name' => 'Pondok Pesantren Darussalam',
                'type' => 'Sekolah',
                'institution_name' => 'Pesantren Darussalam',
                'contact_person' => 'K.H. Ahmad Syamsuddin (Pengadaan Pondok)',
                'phone' => '0819-7766-5544',
                'email' => 'sekretariat@darussalam.ac.id',
                'address' => 'Jl. Pondok Gontor Barat No.12, Ponorogo, Jawa Timur',
                'notes' => 'Pemesanan baju koko santri bahan Toyobo Fodu putih, gamis santriwati, jilbab segi empat, dan sarung tenun seragam.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-007',
                'name' => 'Kementerian Keuangan RI - Kanwil DJP Jabar I',
                'type' => 'Instansi / Pemerintah',
                'institution_name' => 'Kemenkeu DJP',
                'contact_person' => 'Ibu Dian Safitri, S.E. (Panitia HUT Kemenkeu)',
                'phone' => '0812-7788-9900',
                'email' => 'panitia.hut@kemenkeu.go.id',
                'address' => 'Jl. Asia Afrika No.114, Balonggede, Kec. Regol, Kota Bandung',
                'notes' => 'Kaos family gathering bahan Cotton Combed 24s sablon plastisol discharge, topi snapback custom bordir.',
                'is_active' => true,
            ],
            [
                'code' => 'CUST-008',
                'name' => 'Karang Taruna Tunas Harapan Mandiri',
                'type' => 'Komunitas / Organisasi',
                'institution_name' => 'Karang Taruna RW 05',
                'contact_person' => 'Dimas Aditya (Ketua Panitia 17 Agustus)',
                'phone' => '0878-1122-3399',
                'email' => 'kt.tunasharapan@gmail.com',
                'address' => 'Jl. Sukajadi No.45, Sukagalih, Kec. Sukajadi, Kota Bandung',
                'notes' => 'Pemesanan jaket bomber komunitas bahan Taslan waterproof furing polar dan kaos panitia kemerdekaan.',
                'is_active' => true,
            ],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(
                ['code' => $customer['code']],
                $customer
            );
        }
    }
}
