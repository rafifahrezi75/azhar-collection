<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Nota - {{ $invoice->invoice_number }}</title>
    <style>
        /* Mengatur kertas menjadi A5 Landscape (Tidur) */
        @page {
            size: 210mm 148mm;
            margin: 5mm 10mm; /* Margin dikecilkan */
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 13px;
            margin: 0;
            padding: 0;
            color: #1e3a8a;
            background-color: #fff;
        }

        .container {
            width: 100%;
            box-sizing: border-box;
        }

        .text-center { text-align: center; }
        .text-right { text-align: right; }

        /* HEADER SECTION */
        .header-table { width: 100%; margin-bottom: 2px; }
        .logo-title {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 1px;
            margin-bottom: -4px;
            font-family: 'Arial Black', Impact, sans-serif;
        }
        .logo-subtitle {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .address-box {
            display: inline-block;
            margin-left: 10px;
            font-size: 10px;
            line-height: 1.2;
        }

        /* MASTER TABLE (Gabungan Items & Totals) */
        table.master-table {
            width: 100%;
            border-collapse: collapse;
            height: 95mm; /* KUNCI UTAMA: Memaksa tabel melar sampai mentok bawah kertas A5 */
        }

        table.master-table th {
            border: 1px solid #1e3a8a;
            padding: 4px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            height: 1%; /* Agar header tidak ikut melar */
        }

        table.master-table td.cell {
            border: 1px solid #1e3a8a;
            padding: 4px;
            font-size: 12px;
            vertical-align: top;
        }
    </style>
</head>
<body>
    <div class="container">

        <!-- Header -->
        <table class="header-table">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    <table style="width: auto;">
                        <tr>
                            <td class="text-center" style="padding-right: 10px;">
                                <div class="logo-title">AZHAR</div>
                                <div class="logo-subtitle">AZHAR COLLECTION</div>
                            </td>
                            <td style="border-left: 1px solid #1e3a8a; padding-left: 10px;">
                                <div class="address-box">
                                    a : Damarsi Rt.03 Rw.01 Buduran-Sidoarjo<br>
                                    e : email: azharcollection@gmail.com<br>
                                    p : Telp/Hp: 081330666807 (Ach. Haris)<br>
                                    &nbsp;&nbsp;&nbsp;&nbsp;087855476538 (Lazuardi)
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
                <!-- Bagian Alamat Mentok Kanan -->
                <td style="width: 45%; text-align: right; vertical-align: top;">
                    <div style="display: inline-block; text-align: left; font-size: 12px; line-height: 1.3;">
                        <div style="margin-bottom: 2px;">Sidoarjo, {{ date('d F Y', strtotime($invoice->order_date)) }}</div>
                        Kepada yang Terhormat<br>
                        Bpk / Ibu <br>
                        Toko / PT : <span>{{ $invoice->customer_name }}</span><br>
                        No. Telp/HP : <span>{{ $invoice->customer->phone ?? '' }}</span>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Judul Invoice (Margin Atas bisa diubah di margin-top di bawah ini) -->
        <table style="width: 100%; margin-bottom: 2px; margin-top: 5px;">
            <tr>
                <td style="width: 33%; vertical-align: bottom; font-weight: bold; font-size: 12px;">
                    Nota No : {{ $invoice->invoice_number }}
                </td>
                <td style="width: 34%; text-align: center; vertical-align: bottom; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
                    INVOICE
                </td>
                <td style="width: 33%;"></td>
            </tr>
        </table>

        <!-- MASTER TABLE -->
        <table class="master-table">
            <thead>
                <tr>
                    <th style="width: 12%;">Banyak</th>
                    <th style="width: 48%;">Nama Produk</th>
                    <th style="width: 20%;">Harga Satuan</th>
                    <th style="width: 20%;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                <!-- Data Produk -->
                @foreach($invoice->items as $item)
                <tr style="height: 1%;"> <!-- height 1% agar baris data tidak melar -->
                    <td class="cell text-center">{{ $item->qty }}</td>
                    <td class="cell">
                        {{ $item->item_name }}
                        @php
                            $sizes = [];
                            if($item->size_breakdown) {
                                $breakdown = is_string($item->size_breakdown) ? json_decode($item->size_breakdown, true) : $item->size_breakdown;
                                if(is_array($breakdown)) {
                                    foreach($breakdown as $k => $v) {
                                        if(is_array($v) && isset($v['size']) && isset($v['qty']) && $v['qty'] > 0) {
                                            $sizes[] = $v['size'] . '('.$v['qty'].')';
                                        } else if (is_numeric($v) && $v > 0) {
                                            $sizes[] = $k . '('.$v.')';
                                        }
                                    }
                                }
                            }
                        @endphp
                        @if(!empty($sizes))
                            <span style="font-size: 11px; margin-left: 5px;">({{ implode(', ', $sizes) }})</span>
                        @endif
                    </td>
                    <td class="cell text-right">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="cell text-right">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach

                <!-- KOTAK KOSONG (Tanpa height 1%, jadi otomatis akan MELAR mengisi sisa ruang ke bawah) -->
                @php
                    $totalRows = 11;
                    $itemCount = count($invoice->items);
                    $emptyRows = $totalRows - $itemCount;
                    if($emptyRows < 0) $emptyRows = 0;
                @endphp

                @for($i = 0; $i < $emptyRows; $i++)
                <tr>
                    <td class="cell">&nbsp;</td>
                    <td class="cell"></td>
                    <td class="cell"></td>
                    <td class="cell"></td>
                </tr>
                @endfor

                <!-- SUMMARY & TANDA TANGAN (Langsung menyambung di tabel yang sama) -->
                <tr style="height: 1%;"> <!-- height 1% menahan agar footer tidak ikut melar -->
                    <td colspan="2" rowspan="3" style="border: none; vertical-align: bottom; text-align: center; padding-bottom: 5px;">
                        <div style="display: inline-block; width: 45%; font-weight: bold; font-size: 12px; padding-top: 15px;">
                            Tanda Terima<br><br><br><br>
                            ( ___________________ )
                        </div>
                        <div style="display: inline-block; width: 45%; font-weight: bold; font-size: 12px; padding-top: 15px;">
                            Hormat Kami<br><br><br><br>
                            ( ___________________ )
                        </div>
                    </td>
                    <td class="cell text-center" style="font-weight: bold; vertical-align: middle;">TOTAL</td>
                    <td class="cell text-right" style="font-weight: bold; vertical-align: middle;">{{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                </tr>
                <tr style="height: 1%;">
                    <td class="cell text-center" style="vertical-align: middle;">Uang Muka</td>
                    <td class="cell text-right" style="vertical-align: middle;">{{ number_format($invoice->paid_amount, 0, ',', '.') }}</td>
                </tr>
                <tr style="height: 1%;">
                    @php $sisa = $invoice->total_amount - $invoice->paid_amount; @endphp
                    <td class="cell text-center" style="vertical-align: middle;">Kekurangan</td>
                    <td class="cell text-right" style="vertical-align: middle;">{{ number_format($sisa > 0 ? $sisa : 0, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

    </div>
</body>
</html>
