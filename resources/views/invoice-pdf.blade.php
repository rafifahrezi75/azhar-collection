<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nota - {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 14px;
            margin: 0;
            padding: 0;
            color: #0f172a;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-left { text-align: left; }
        .font-bold { font-weight: bold; }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td, th {
            vertical-align: top;
        }
        
        .header-table {
            margin-bottom: 10px;
        }
        .header-left {
            width: 60%;
        }
        .header-right {
            width: 40%;
            text-align: right;
            font-size: 13px;
            line-height: 1.5;
        }
        
        .logo-text {
            font-size: 32px;
            font-weight: 900;
            color: #1e3a8a; /* Dark blue matching receipt */
            margin-bottom: 2px;
            letter-spacing: -1px;
        }
        .sub-logo {
            font-size: 14px;
            color: #1e3a8a;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .address-box {
            font-size: 11px;
            color: #334155;
            line-height: 1.4;
        }
        
        .invoice-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            color: #1e3a8a;
            margin: 15px 0;
            letter-spacing: 1px;
        }
        
        .nota-no {
            font-weight: bold;
            font-size: 14px;
            color: #1e3a8a;
            margin-bottom: 5px;
        }
        
        table.items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border: 2px solid #3b82f6;
        }
        table.items th {
            border: 1px solid #3b82f6;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            color: #1e3a8a;
        }
        table.items td {
            border: 1px solid #3b82f6;
            padding: 8px;
            vertical-align: top;
        }
        
        .size-detail {
            font-size: 11px;
            color: #475569;
            margin-top: 4px;
            padding-left: 10px;
        }
        
        .footer-table {
            width: 100%;
            margin-top: 10px;
        }
        
        .signature-area {
            width: 60%;
        }
        
        .signature-box {
            display: inline-block;
            width: 45%;
            text-align: center;
            font-weight: bold;
            color: #1e3a8a;
        }
        .signature-line {
            margin-top: 60px;
            border-bottom: 1px dotted #1e3a8a;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
        }
        
        .totals-area {
            width: 40%;
        }
        table.totals {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #3b82f6;
        }
        table.totals td {
            border: 1px solid #3b82f6;
            padding: 8px;
            color: #1e3a8a;
            font-weight: bold;
        }
        
        .customer-info {
            text-align: left;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <table class="header-table">
            <tr>
                <td class="header-left">
                    <div class="logo-text">AZHAR</div>
                    <div class="sub-logo">AZHAR COLLECTION</div>
                    <div class="address-box">
                        a : Jl. Contoh Alamat No. 123, Kota<br>
                        e : azharcollection@gmail.com<br>
                        p : Telp/Hp: 0812-3456-7890
                    </div>
                </td>
                <td class="header-right">
                    Sidoarjo, {{ date('d F Y', strtotime($invoice->order_date)) }}<br>
                    <div style="margin-top: 10px; text-align: right;">
                        <div class="customer-info">
                            Kepada yang Terhormat<br>
                            Bpk/Ibu <br>
                            Toko/PT : <span style="border-bottom: 1px dotted #000; padding-bottom: 2px;">{{ $invoice->customer_name }}</span><br>
                            No. Telp/HP : <span style="border-bottom: 1px dotted #000; padding-bottom: 2px;">{{ $invoice->customer->phone ?? '....................' }}</span>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        
        <div class="invoice-title">INVOICE</div>
        
        <div class="nota-no">
            Nota No : <span style="border-bottom: 1px dotted #000; display: inline-block; min-width: 150px; font-weight: normal; color: #333;">{{ $invoice->invoice_number }}</span>
        </div>

        <!-- Items -->
        <table class="items">
            <thead>
                <tr>
                    <th style="width: 15%;">Banyak</th>
                    <th style="width: 40%;">Nama Produk</th>
                    <th style="width: 20%;">Harga Satuan</th>
                    <th style="width: 25%;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                <tr>
                    <td class="text-center" style="font-size: 16px;">{{ $item->qty }}</td>
                    <td>
                        <div style="font-size: 16px;">{{ $item->item_name }}</div>
                        @php
                            $sizes = [];
                            if($item->size_breakdown) {
                                $breakdown = is_string($item->size_breakdown) ? json_decode($item->size_breakdown, true) : $item->size_breakdown;
                                if(is_array($breakdown)) {
                                    foreach($breakdown as $k => $v) {
                                        if(is_array($v) && isset($v['size']) && isset($v['qty'])) {
                                            if($v['qty'] > 0) $sizes[] = $v['size'] . ' (' . $v['qty'] . ')';
                                        } else if (is_numeric($v) && $v > 0) {
                                            $sizes[] = $k . ' (' . $v . ')';
                                        }
                                    }
                                }
                            }
                        @endphp
                        @if(!empty($sizes))
                            <div class="size-detail">Ukuran: {{ implode(', ', $sizes) }}</div>
                        @endif
                    </td>
                    <td class="text-right" style="font-size: 16px;">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="text-right" style="font-size: 16px;">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
                <!-- Fill empty rows to make it look like a receipt book if few items -->
                @for($i = count($invoice->items); $i < 5; $i++)
                <tr>
                    <td style="color: transparent;">-</td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
                @endfor
            </tbody>
        </table>

        <!-- Footer -->
        <table class="footer-table">
            <tr>
                <td class="signature-area">
                    <div class="signature-box">
                        Tanda Terima
                        <div class="signature-line">(.........................)</div>
                    </div>
                    <div class="signature-box">
                        Hormat Kami
                        <div class="signature-line">(.........................)</div>
                    </div>
                </td>
                <td class="totals-area">
                    <table class="totals">
                        <tr>
                            <td style="width: 50%; text-align: center;">TOTAL</td>
                            <td style="width: 50%; text-align: right; font-size: 18px;">{{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <td style="text-align: center;">Uang Muka</td>
                            <td style="text-align: right; font-size: 16px;">{{ number_format($invoice->paid_amount, 0, ',', '.') }}</td>
                        </tr>
                        @php $sisa = $invoice->total_amount - $invoice->paid_amount; @endphp
                        <tr>
                            <td style="text-align: center;">Kekurangan</td>
                            <td style="text-align: right; font-size: 16px;">{{ number_format($sisa > 0 ? $sisa : 0, 0, ',', '.') }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        @if($invoice->notes)
        <div style="margin-top: 15px; font-size: 12px; color: #475569;">
            * Catatan: {{ $invoice->notes }}
        </div>
        @endif
    </div>
</body>
</html>
