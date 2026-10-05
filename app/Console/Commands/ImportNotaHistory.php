<?php

namespace App\Console\Commands;

use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportNotaHistory extends Command
{
    protected $signature = 'import:nota-history {--file= : Path ke file JSON nota}';

    protected $description = 'Import data transaksi dan produk dari file JSON nota ke database';

    public function handle(): int
    {
        $filePath = $this->option('file') ?: storage_path('app/private/nota_2013_2016.json');

        if (! file_exists($filePath)) {
            $this->error("File tidak ditemukan: {$filePath}");

            return Command::FAILURE;
        }

        $json = json_decode(file_get_contents($filePath), true);
        if (! $json || ! isset($json['referensi']['daftar_produk']) || ! isset($json['data_transaksi'])) {
            $this->error('Format JSON tidak valid');

            return Command::FAILURE;
        }

        $admin = User::first();
        $adminId = $admin ? $admin->id : 1;

        DB::beginTransaction();
        try {
            $customerMap = Customer::all()->keyBy(fn ($c) => strtoupper(trim($c->name)));
            $lastCustCode = Customer::max('id') ?? 0;

            $productMap = Product::all()->keyBy('code');

            foreach ($json['referensi']['daftar_produk'] as $pData) {
                $custName = $pData['pelanggan'];
                $customerId = null;

                if ($custName) {
                    $key = strtoupper(trim($custName));
                    if (! $customerMap->has($key)) {
                        $lastCustCode++;
                        $newCode = sprintf('CUST-%03d', $lastCustCode);
                        $createdCust = Customer::create([
                            'code' => $newCode,
                            'name' => $custName,
                            'type' => 'Sekolah / Instansi',
                            'is_active' => true,
                        ]);
                        $customerMap->put($key, $createdCust);
                    }
                    $customerId = $customerMap->get($key)->id;
                }

                $pCode = $pData['kode_produk'];
                if (! $productMap->has($pCode)) {
                    $createdProd = Product::create([
                        'code' => $pCode,
                        'customer_id' => $customerId,
                        'name' => $pData['nama'],
                        'category' => $pData['kategori'],
                        'default_unit' => ucfirst(strtolower($pData['satuan'])),
                        'base_price' => $pData['harga_dasar'],
                        'production_wage_mode' => 'steps',
                        'production_wage' => 0,
                        'is_active' => true,
                    ]);
                    $productMap->put($pCode, $createdProd);
                }
            }

            $invoiceCount = 0;
            $itemCount = 0;

            foreach ($json['data_transaksi'] as $index => $tData) {
                $custName = $tData['pelanggan'];
                $customerId = null;
                $displayCustName = $custName ?: 'Pelanggan Umum';

                if ($custName) {
                    $key = strtoupper(trim($custName));
                    if ($customerMap->has($key)) {
                        $customerId = $customerMap->get($key)->id;
                        $displayCustName = $customerMap->get($key)->name;
                    }
                }

                $orderDate = Carbon::parse($tData['tanggal']);
                $invNumber = sprintf('INV-%s-%04d', $orderDate->format('Ymd'), $index + 1);

                $existingInv = Invoice::where('invoice_number', $invNumber)->first();
                if ($existingInv) {
                    continue;
                }

                $invoice = Invoice::create([
                    'invoice_number' => $invNumber,
                    'customer_id' => $customerId,
                    'customer_name' => $displayCustName,
                    'order_date' => $orderDate->format('Y-m-d'),
                    'completion_date' => $orderDate->format('Y-m-d'),
                    'type' => 'REGULAR',
                    'subtotal' => $tData['total_transaksi'],
                    'discount' => 0,
                    'total_amount' => $tData['total_transaksi'],
                    'paid_amount' => $tData['total_transaksi'],
                    'payment_status' => 'LUNAS',
                    'production_status' => 'SELESAI',
                    'cut_stock' => false,
                    'notes' => $tData['keterangan'] ?? null,
                    'created_by' => $adminId,
                    'created_at' => $orderDate->startOfDay(),
                    'updated_at' => $orderDate->startOfDay(),
                ]);

                foreach ($tData['item'] as $iData) {
                    $prod = $productMap->get($iData['kode_produk']);

                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'product_id' => $prod ? $prod->id : null,
                        'item_name' => $iData['deskripsi'],
                        'unit' => ucfirst(strtolower($iData['satuan'])),
                        'qty' => $iData['jumlah'],
                        'unit_price' => $iData['harga_satuan'],
                        'subtotal' => $iData['total'],
                        'size_breakdown' => $iData['ukuran'] ?? null,
                        'description' => $iData['deskripsi'],
                        'created_at' => $orderDate->startOfDay(),
                        'updated_at' => $orderDate->startOfDay(),
                    ]);
                    $itemCount++;
                }

                $invoiceCount++;
            }

            DB::commit();

            $this->info('Import berhasil!');
            $this->info("Total invoice diimport: {$invoiceCount}");
            $this->info("Total invoice item diimport: {$itemCount}");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Gagal import: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
