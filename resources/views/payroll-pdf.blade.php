<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Slip Gaji - {{ $user->name }} - {{ $periodName }}</title>
    <style>
        @page {
            size: 210mm 148mm;
            margin: 5mm 10mm;
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

        table.master-table {
            width: 100%;
            border-collapse: collapse;
            height: 95mm;
        }

        table.master-table th {
            border: 1px solid #1e3a8a;
            padding: 4px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
            height: 1%;
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
    @php
        $totalRows = 10;
        $chunks = array_chunk($payrollItems, $totalRows);
        if (empty($chunks)) {
            $chunks = [[]];
        }
        $totalPages = count($chunks);
    @endphp

    @foreach($chunks as $pageIndex => $pageItems)
    <div class="container" style="{{ $pageIndex < $totalPages - 1 ? 'page-break-after: always;' : '' }}">

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
                <td style="width: 45%; text-align: right; vertical-align: top;">
                    <div style="display: inline-block; text-align: left; font-size: 12px; line-height: 1.3;">
                        <div style="margin-bottom: 2px;">Sidoarjo, {{ date('d F Y') }}</div>
                        <strong>Nama Karyawan:</strong> {{ $user->name }}<br>
                        <strong>Periode Gaji:</strong> {{ $periodName }}<br>
                        <strong>Email / Kontak:</strong> {{ $user->email ?? '-' }}
                    </div>
                </td>
            </tr>
        </table>

        <table style="width: 100%; margin-bottom: 2px; margin-top: 5px;">
            <tr>
                <td style="width: 33%; vertical-align: bottom; font-weight: bold; font-size: 12px;">
                    SLIP NO : SLIP-{{ date('Ym') }}-{{ str_pad($user->id, 4, '0', STR_PAD_LEFT) }}
                </td>
                <td style="width: 34%; text-align: center; vertical-align: bottom; font-weight: bold; font-size: 16px; letter-spacing: 1px;">
                    SLIP PENGGAJIAN
                </td>
                <td style="width: 33%; text-align: right; font-size: 11px; vertical-align: bottom;">
                    Periode: {{ $periodName }}
                </td>
            </tr>
        </table>

        <table class="master-table">
            <thead>
                <tr>
                    <th style="width: 8%;">No</th>
                    <th style="width: 52%;">Nama Produk</th>
                    <th style="width: 12%;">Banyak</th>
                    <th style="width: 14%;">Harga Satuan</th>
                    <th style="width: 14%;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($pageItems as $item)
                @php
                    $rowNo = ($pageIndex * $totalRows) + $loop->iteration;
                @endphp
                <tr style="height: 1%;">
                    <td class="cell text-center">{{ $rowNo }}</td>
                    <td class="cell">
                        {{ $item['product_label'] }}
                    </td>
                    <td class="cell text-center">{{ $item['qty'] }}</td>
                    <td class="cell text-right">{{ number_format($item['unit_wage'], 0, ',', '.') }}</td>
                    <td class="cell text-right font-bold">{{ number_format($item['subtotal'], 0, ',', '.') }}</td>
                </tr>
                @endforeach

                @php
                    $itemCount = count($pageItems);
                    $emptyRows = $totalRows - $itemCount;
                    if ($emptyRows < 0) $emptyRows = 0;
                @endphp

                @for($i = 0; $i < $emptyRows; $i++)
                <tr>
                    <td class="cell">&nbsp;</td>
                    <td class="cell"></td>
                    <td class="cell"></td>
                    <td class="cell"></td>
                    <td class="cell"></td>
                </tr>
                @endfor

                <tr style="height: 1%;">
                    <td colspan="3" rowspan="2" style="border: none; vertical-align: bottom; text-align: center; padding-bottom: 5px;">
                        <div style="display: inline-block; width: 45%; font-weight: bold; font-size: 12px; padding-top: 15px;">
                            <br>Tanda Terima<br><br><br><br><br>
                            ( {{ $user->name }} )
                        </div>
                        <div style="display: inline-block; width: 45%; font-weight: bold; font-size: 12px; padding-top: 15px;">
                            <br>Hormat Kami<br><br><br><br><br>
                            ( Azhar Collection )
                        </div>
                    </td>
                    <td class="cell text-center" style="font-weight: bold; vertical-align: middle;">TOTAL UPAH</td>
                    <td class="cell text-right" style="font-weight: bold; vertical-align: middle;">{{ number_format($grandTotalWage, 0, ',', '.') }}</td>
                </tr>
                <tr style="height: 1%;">
                    <td colspan="2" class="cell" style="font-size: 10px; vertical-align: top; padding: 4px;">
                        <strong>Catatan:</strong><br>
                        Upah borongan resmi Azhar Collection periode {{ $periodName }}.
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="text-align: right; font-size: 10px; color: #1e3a8a; margin-top: 2px;">
            Halaman {{ $pageIndex + 1 }} dari {{ $totalPages }}
        </div>

    </div>
    @endforeach
</body>
</html>
