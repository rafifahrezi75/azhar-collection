<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Nota Pembelian - {{ $purchase->reference_no }}</title>
    <style>
        @page {
            size: 210mm 148mm;
            margin: 5mm 10mm;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.15;
            margin: 0;
            padding: 0;
            color: #1e3a8a;
            background-color: #fff;
        }

        .container {
            width: 100%;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .header-table {
            width: 100%;
            margin: 0 0 2px;
            border-collapse: collapse;
        }

        .logo-title {
            font-family: 'Arial Black', Impact, sans-serif;
            font-size: 26px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: 1px;
            margin-bottom: -2px;
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

        .title-table {
            width: 100%;
            margin: 3px 0 2px;
            border-collapse: collapse;
        }

        table.master-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        table.master-table thead {
            display: table-row-group;
        }

        table.master-table tr {
            page-break-inside: avoid;
        }

        table.master-table th {
            height: 22px;
            border: 1px solid #1e3a8a;
            padding: 2px 4px;
            text-align: center;
            vertical-align: middle;
            font-size: 12px;
            font-weight: bold;
            line-height: 1.15;
        }

        table.master-table td.cell {
            height: 22px;
            border: 1px solid #1e3a8a;
            padding: 2px 4px;
            vertical-align: middle;
            font-size: 12px;
            line-height: 1.15;
        }

        .footer-table {
            width: 100%;
            margin-top: -1px;
            border-collapse: collapse;
            table-layout: fixed;
            page-break-inside: avoid;
        }

        .signature-cell {
            width: 60%;
            height: 70px;
            padding: 4px 8px 2px;
            border-top: 1px solid #1e3a8a;
            vertical-align: top;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            text-align: center;
            font-size: 12px;
        }

        .signature-space {
            height: 28px;
        }

        .summary-wrapper {
            width: 40%;
            padding: 0;
            vertical-align: top;
        }

        .summary-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .total-cell {
            height: 22px;
            border: 1px solid #1e3a8a;
            padding: 2px 4px;
            vertical-align: middle;
            font-size: 12px;
            line-height: 1.15;
            font-weight: bold;
        }

        .notes-cell {
            height: 48px;
            border: 1px solid #1e3a8a;
            padding: 6px 5px 3px;
            vertical-align: top;
            text-align: left;
            font-size: 12px;
            line-height: 1.2;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 55%; vertical-align: top;">
                    <table style="width: auto; border-collapse: collapse;">
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
                    <div style="display: inline-block; text-align: left; font-size: 12px; line-height: 1.25;">
                        <div style="margin-bottom: 2px;">
                            Sidoarjo, {{ \Carbon\Carbon::parse($purchase->date)->translatedFormat('d F Y') }}
                        </div>
                        Supplier / Toko:<br>
                        <span style="font-size: 14px; font-weight: bold;">
                            {{ $purchase->supplier_name ?: '-' }}
                        </span><br>
                        Admin:
                        <span>
                            {{ $purchase->creator ? $purchase->creator->name : '-' }}
                        </span>
                    </div>
                </td>
            </tr>
        </table>

        <table class="title-table">
            <tr>
                <td style="width: 33%; vertical-align: bottom; font-size: 12px; font-weight: bold;">
                    Ref : {{ $purchase->reference_no }}
                </td>
                <td style="width: 34%; text-align: center; vertical-align: bottom; font-size: 15px; font-weight: bold; letter-spacing: 1px;">
                    NOTA PEMBELIAN
                </td>
                <td style="width: 33%;"></td>
            </tr>
        </table>

        <table class="master-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Banyak</th>
                    <th style="width: 45%;">Nama Barang</th>
                    <th style="width: 20%;">Harga Satuan</th>
                    <th style="width: 20%;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalRows = 10;
                    $items = $purchase->items;
                    $notes = trim((string) $purchase->notes);
                @endphp

                @for($i = 0; $i < $totalRows; $i++)
                    <tr>
                        @if(isset($items[$i]))
                            @php
                                $item = $items[$i];
                                $unitName = optional($item->unit)->name
                                    ?? optional(optional($item->item)->unit)->name
                                    ?? '-';
                            @endphp

                            <td class="cell text-center">
                                {{ $item->quantity }} {{ $unitName }}
                            </td>
                            <td class="cell">
                                {{ $item->item->name }}
                                <span style="font-size: 11px; margin-left: 5px;">
                                    (Kode: {{ $item->item->code }})
                                </span>
                            </td>
                            <td class="cell text-right">
                                {{ number_format($item->unit_price, 0, ',', '.') }}
                            </td>
                            <td class="cell text-right">
                                {{ number_format($item->subtotal, 0, ',', '.') }}
                            </td>
                        @else
                            <td class="cell">&nbsp;</td>
                            <td class="cell">&nbsp;</td>
                            <td class="cell">&nbsp;</td>
                            <td class="cell">&nbsp;</td>
                        @endif
                    </tr>
                @endfor
            </tbody>
        </table>

        <table class="footer-table">
            <tr>
                <td class="signature-cell">
                    <table class="signature-table">
                        <tr>
                            <td style="width: 50%; font-weight: bold;">
                                Mengetahui
                            </td>
                            <td style="width: 50%; font-weight: bold;">
                                Dibuat Oleh
                            </td>
                        </tr>
                        <tr>
                            <td class="signature-space"></td>
                            <td class="signature-space"></td>
                        </tr>
                        <tr>
                            <td>
                                ( ___________________ )<br>
                                <span style="font-size: 11px;">
                                    Pemilik
                                </span>
                            </td>
                            <td>
                                ( ___________________ )<br>
                                <span style="font-size: 11px;">
                                    {{ $purchase->creator ? $purchase->creator->name : 'Admin' }}
                                </span>
                            </td>
                        </tr>
                    </table>
                </td>

                <td class="summary-wrapper">
                    <table class="summary-table">
                        <tr>
                            <td class="total-cell text-center" style="width: 50%;">
                                TOTAL
                            </td>
                            <td class="total-cell text-right" style="width: 50%;">
                                {{ number_format($purchase->total_amount, 0, ',', '.') }}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" class="notes-cell">
                                <strong>Catatan :</strong>
                                {{ $notes !== '' ? $notes : '-' }}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
