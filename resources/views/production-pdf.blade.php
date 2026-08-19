<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Surat Perintah Kerja (SPK) - {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 13px;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
        .header {
            margin-bottom: 25px;
            border-bottom: 2px solid #222;
            padding-bottom: 15px;
        }
        .header-title {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 5px;
        }
        
        .info-table {
            width: 100%;
            margin-bottom: 25px;
        }
        .info-table td {
            vertical-align: top;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
        }

        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        table.items th {
            background-color: #f1f5f9;
            border: 1px solid #94a3b8;
            padding: 10px;
            text-align: left;
            font-weight: bold;
        }
        table.items td {
            border: 1px solid #94a3b8;
            padding: 10px;
            vertical-align: top;
        }

        table.steps {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
        }
        table.steps th, table.steps td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            text-align: left;
        }
        table.steps th {
            background-color: #f8fafc;
        }
        
        .signature-section {
            clear: both;
            margin-top: 60px;
            width: 100%;
        }
        .signature-box {
            float: left;
            width: 33%;
            text-align: center;
        }
        .signature-line {
            margin-top: 80px;
            border-bottom: 1px solid #000;
            width: 70%;
            margin-left: auto;
            margin-right: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <table class="info-table" style="margin-bottom: 10px; border-bottom: 2px solid #222; padding-bottom: 15px;">
            <tr>
                <td style="width: 50%;">
                    <div class="header-title">SURAT PERINTAH KERJA (SPK)</div>
                    <div style="font-size: 15px; font-weight: bold; color: #0d9488;">AZHAR COLLECTION</div>
                </td>
                <td style="width: 50%; text-align: right;">
                    <div><strong>No SPK:</strong> {{ $invoice->invoice_number }}</div>
                    <div><strong>Tanggal Mulai:</strong> {{ date('d M Y', strtotime($invoice->order_date)) }}</div>
                    <div><strong>Estimasi Selesai:</strong> {{ $invoice->completion_date ? date('d M Y', strtotime($invoice->completion_date)) : '-' }}</div>
                </td>
            </tr>
        </table>
        
        <!-- Customer Info -->
        <table class="info-table" style="margin-bottom: 30px;">
            <tr>
                <td style="width: 50%;">
                    <div><strong>Nama Pelanggan / Instansi:</strong></div>
                    <div style="font-size: 15px; font-weight: bold; margin-top: 5px;">{{ $invoice->customer_name }}</div>
                </td>
            </tr>
        </table>

        <div class="section-title">RINCIAN PEKERJAAN & LANGKAH PRODUKSI</div>

        @foreach($invoice->items as $index => $item)
        <table class="items" style="margin-bottom: 10px;">
            <thead>
                <tr>
                    <th style="width: 5%; text-align: center;">No</th>
                    <th style="width: 45%;">Nama Produk</th>
                    <th style="width: 25%;">Rincian Ukuran</th>
                    <th style="width: 25%; text-align: center;">Total Kuantitas</th>
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
                                        if(is_array($v) && isset($v['size']) && isset($v['qty'])) {
                                            if($v['qty'] > 0) $sizes[] = $v['size'] . ': ' . $v['qty'];
                                        } else if (is_numeric($v) && $v > 0) {
                                            $sizes[] = $k . ': ' . $v;
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
                    <td class="text-center font-bold" style="font-size: 15px;">{{ $item->qty }} {{ $item->unit }}</td>
                </tr>
            </tbody>
        </table>

        <!-- Production Steps -->
        @if($item->product && $item->product->productionSteps && $item->product->productionSteps->count() > 0)
            <div style="margin-bottom: 5px; font-weight: bold; font-size: 12px; color: #475569;">Daftar Langkah Produksi:</div>
            <table class="steps" style="margin-bottom: 40px;">
                <thead>
                    <tr>
                        <th style="width: 5%; text-align: center;">Urutan</th>
                        <th style="width: 30%;">Tahapan Kerja</th>
                        <th style="width: 15%;">Estimasi Waktu</th>
                        <th style="width: 15%; text-align: center;">Status Target</th>
                        <th style="width: 35%;">Penanggung Jawab / Keterangan</th>
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
            <div style="margin-bottom: 40px; font-size: 12px; font-style: italic; color: #94a3b8;">
                (Tidak ada detail langkah produksi khusus untuk item ini)
            </div>
        @endif
        @endforeach

        @if($invoice->notes)
        <div style="margin-top: 20px; font-size: 12px;">
            <strong>Catatan Pesanan:</strong><br>
            {{ $invoice->notes }}
        </div>
        @endif

        <!-- Signatures -->
        <div class="signature-section">
            <div class="signature-box">
                <div>Penanggung Jawab Produksi,</div>
                <div class="signature-line"></div>
                <div>( ........................................... )</div>
            </div>
            <div class="signature-box">
                <div>Quality Control,</div>
                <div class="signature-line"></div>
                <div>( ........................................... )</div>
            </div>
            <div class="signature-box">
                <div>Mengetahui,</div>
                <div class="signature-line"></div>
                <div>( Pimpinan / Admin )</div>
            </div>
        </div>
    </div>
</body>
</html>
