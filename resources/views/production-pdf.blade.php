<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Surat Perintah Kerja (SPK) - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            color: #1e293b;
            background-color: #fff;
        }

        .container {
            width: 100%;
            box-sizing: border-box;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        /* Header SPK */
        .header-table {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header-title {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 3px;
        }

        /* Section Title */
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            color: #1e3a8a;
        }

        /* Tabel Item Produk */
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        table.items th {
            background-color: #f1f5f9;
            border: 1px solid #94a3b8;
            padding: 6px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            color: #334155;
        }
        table.items td {
            border: 1px solid #94a3b8;
            padding: 6px 8px;
            vertical-align: top;
            font-size: 12px;
        }

        /* Tabel Langkah Produksi */
        table.steps {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
            margin-bottom: 20px;
            font-size: 11px;
        }
        table.steps th, table.steps td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            text-align: left;
        }
        table.steps th {
            background-color: #f8fafc;
            color: #334155;
        }

        /* Signature Section */
        .signature-section {
            margin-top: 30px;
            width: 100%;
            display: table;
            page-break-inside: avoid; /* Mencegah tanda tangan terpotong halaman */
        }
        .signature-box {
            display: table-cell;
            width: 33.33%;
            text-align: center;
            font-size: 12px;
        }
        .signature-line {
            margin-top: 55px;
            border-bottom: 1px solid #000;
            width: 75%;
            margin-left: auto;
            margin-right: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    <div class="header-title">SURAT PERINTAH KERJA (SPK)</div>
                    <div style="font-size: 14px; font-weight: bold; color: #0d9488;">AZHAR COLLECTION</div>
                </td>
                <td style="width: 45%; text-align: right; vertical-align: top; font-size: 11px; line-height: 1.4;">
                    <div><strong>No SPK:</strong> {{ $invoice->invoice_number }}</div>
                    <div><strong>Tanggal Mulai:</strong> {{ date('d M Y', strtotime($invoice->order_date)) }}</div>
                    <div><strong>Estimasi Selesai:</strong> {{ $invoice->completion_date ? date('d M Y', strtotime($invoice->completion_date)) : '-' }}</div>
                </td>
            </tr>
        </table>

        <!-- Customer Info -->
        <div style="margin-bottom: 15px; font-size: 12px;">
            <strong>Nama Pelanggan / Instansi:</strong>
            <span style="font-size: 14px; font-weight: bold; margin-left: 5px;">{{ $invoice->customer_name }}</span>
        </div>

        <div class="section-title">RINCIAN PEKERJAAN & LANGKAH PRODUKSI</div>

        @foreach($invoice->items as $index => $item)
        <table class="items">
            <thead>
                <tr>
                    <th style="width: 5%; text-align: center;">No</th>
                    <th style="width: 45%;">Nama Produk</th>
                    <th style="width: 30%;">Rincian Ukuran</th>
                    <th style="width: 20%; text-align: center;">Total Kuantitas</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="font-bold">{{ $item->item_name }}</td>
                    <td>
                        @php
                            $sizes = [];
                            if($item->size_breakdown) {
                                $breakdown = is_string($item->size_breakdown) ? json_decode($item->size_breakdown, true) : $item->size_breakdown;
                                if(is_array($breakdown)) {
                                    foreach($breakdown as $k => $v) {
                                        if(is_array($v) && isset($v['qty']) && $v['qty'] > 0) {
                                            $price = isset($v['price']) ? $v['price'] : $item->unit_price;
                                            $sizes[] = $k . ': ' . $v['qty'] . ' x ' . number_format($price, 0, ',', '.');
                                        } else if (is_numeric($v) && $v > 0) {
                                            $sizes[] = $k . ': ' . $v . ' x ' . number_format($item->unit_price, 0, ',', '.');
                                        }
                                    }
                                }
                            }
                        @endphp
                        @if(!empty($sizes))
                            {{ implode(', ', $sizes) }}
                        @else
                            -
                        @endif
                    </td>
                    <td class="text-center font-bold" style="font-size: 14px;">{{ $item->qty }} {{ $item->unit ?? 'Pcs' }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Production Steps -->
        @if($item->product && $item->product->productionSteps && $item->product->productionSteps->count() > 0)
            <div style="margin-bottom: 3px; font-weight: bold; font-size: 11px; color: #475569;">Daftar Langkah Produksi:</div>
            <table class="steps">
                <thead>
                    <tr>
                        <th style="width: 8%; text-align: center;">Urutan</th>
                        <th style="width: 35%;">Tahapan Kerja</th>
                        <th style="width: 17%;">Estimasi Waktu</th>
                        <th style="width: 15%; text-align: center;">Status Target</th>
                        <th style="width: 25%;">Paraf / Keterangan</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($item->product->productionSteps->sortBy('step_order') as $stepItem)
                    <tr>
                        <td class="text-center">{{ $stepItem->step_order }}</td>
                        <td class="font-bold">{{ $stepItem->productionStep ? $stepItem->productionStep->name : 'N/A' }}</td>
                        <td>{{ $stepItem->estimated_time_days }} hari</td>
                        <td class="text-center">[&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;] Selesai</td>
                        <td></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div style="margin-bottom: 15px; font-size: 11px; font-style: italic; color: #94a3b8;">
                (Tidak ada detail langkah produksi khusus untuk item ini)
            </div>
        @endif
        @endforeach

        @if($invoice->notes)
        <div style="margin-top: 15px; font-size: 11px; background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 8px; border-radius: 4px;">
            <strong>Catatan Pesanan:</strong><br>
            {{ $invoice->notes }}
        </div>
        @endif

        <!-- Signatures -->
        <div class="signature-section">
            <div class="signature-box">
                <div>Penanggung Jawab Produksi,</div>
                <div class="signature-line"></div>
                <div style="margin-top: 5px;">( ................................... )</div>
            </div>
            <div class="signature-box">
                <div>Quality Control,</div>
                <div class="signature-line"></div>
                <div style="margin-top: 5px;">( ................................... )</div>
            </div>
            <div class="signature-box">
                <div>Mengetahui,</div>
                <div class="signature-line"></div>
                <div style="margin-top: 5px;">( Pimpinan / Admin )</div>
            </div>
        </div>
    </div>
</body>
</html>
