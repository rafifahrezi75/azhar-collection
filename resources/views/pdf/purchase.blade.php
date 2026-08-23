<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Nota Pembelian - {{ $purchase->reference_no }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            color: #333;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0 0;
            color: #666;
        }
        .info-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .info-table td {
            padding: 4px 0;
        }
        .info-table td:first-child {
            width: 120px;
            font-weight: bold;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .items-table .text-right {
            text-align: right;
        }
        .items-table .text-center {
            text-align: center;
        }
        .total-row td {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .notes {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #0d9488;
            margin-bottom: 30px;
        }
        .notes p {
            margin: 0;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #777;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .signatures {
            width: 100%;
            margin-top: 50px;
        }
        .signatures td {
            text-align: center;
            width: 50%;
        }
        .sig-line {
            display: inline-block;
            width: 200px;
            border-top: 1px solid #333;
            margin-top: 70px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>Azhar Collection</h1>
        <p>Grosir & Eceran Seragam Sekolah</p>
        <p style="font-size: 16px; font-weight: bold; margin-top: 10px; color: #000;">NOTA PEMBELIAN (KULAAN)</p>
    </div>

    <table class="info-table">
        <tr>
            <td>No. Referensi</td>
            <td>: {{ $purchase->reference_no }}</td>
            <td>Tanggal</td>
            <td>: {{ \Carbon\Carbon::parse($purchase->date)->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td>Supplier / Toko</td>
            <td>: {{ $purchase->supplier_name ?: '-' }}</td>
            <td>Admin</td>
            <td>: {{ $purchase->creator ? $purchase->creator->name : '-' }}</td>
        </tr>
    </table>

    <table class="items-table">
        <thead>
            <tr>
                <th class="text-center" width="5%">No</th>
                <th width="32%">Nama Barang</th>
                <th class="text-right" width="12%">Kuantitas</th>
                <th width="16%">Satuan</th>
                <th class="text-right" width="17%">Harga Satuan</th>
                <th class="text-right" width="18%">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($purchase->items as $index => $item)
            @php
                $unitName = optional($item->unit)->name ?? optional(optional($item->item)->unit)->name ?? '-';
                $unitSymbol = optional($item->unit)->symbol ?? optional(optional($item->item)->unit)->symbol ?? '';
            @endphp
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>
                    {{ $item->item->name }}<br>
                    <small style="color: #666;">Kode: {{ $item->item->code }}</small>
                </td>
                <td class="text-right">{{ $item->quantity }}</td>
                <td>{{ $unitName }}@if($unitSymbol) ({{ $unitSymbol }})@endif</td>
                <td class="text-right">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
            </tr>
            @endforeach
            <tr class="total-row">
                <td colspan="5" class="text-right">TOTAL PEMBELIAN:</td>
                <td class="text-right">Rp {{ number_format($purchase->total_amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    @if($purchase->notes)
    <div class="notes">
        <strong>Catatan:</strong><br>
        <p>{{ $purchase->notes }}</p>
    </div>
    @endif

    <table class="signatures">
        <tr>
            <td>
                Mengetahui,<br>
                <span class="sig-line"></span>
                <br>Pemilik
            </td>
            <td>
                Dibuat Oleh,<br>
                <span class="sig-line"></span>
                <br>{{ $purchase->creator ? $purchase->creator->name : 'Admin' }}
            </td>
        </tr>
    </table>

    <div class="footer">
        Dicetak pada: {{ \Carbon\Carbon::now()->translatedFormat('d F Y H:i') }} oleh {{ auth()->user()->name ?? 'Sistem' }}
    </div>

</body>
</html>
