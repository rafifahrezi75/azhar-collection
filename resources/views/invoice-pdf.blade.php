<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Nota - {{ $invoice->invoice_number }}</title>
    <style>
        @page {
            size: 210mm 148mm;
            margin: 3mm 8mm 3mm 8mm;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
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
            font-size: 20px;
            font-weight: 900;
            letter-spacing: 1px;
            margin-bottom: -2px;
            font-family: 'Arial Black', Impact, sans-serif;
        }
        .logo-subtitle {
            font-size: 9.5px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }
        .address-box {
            display: inline-block;
            margin-left: 8px;
            font-size: 9px;
            line-height: 1.15;
        }

        table.master-table {
            width: 100%;
            border-collapse: collapse;
        }

        table.master-table th {
            border: 1px solid #1e3a8a;
            padding: 3px 4px;
            text-align: center;
            font-weight: bold;
            font-size: 10.5px;
            height: 6mm;
        }

        table.master-table td.cell {
            border: 1px solid #1e3a8a;
            padding: 2px 4px;
            font-size: 10px;
            vertical-align: middle;
            height: 7.2mm;
        }

        .row-holder {
            min-height: 6mm;
            line-height: 1.2;
        }
    </style>
</head>
<body>
    @php
        $totalRows = 9;
        $itemsArray = $invoice->items ? $invoice->items->all() : [];
        $chunks = array_chunk($itemsArray, $totalRows);
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
                            <td class="text-center" style="padding-right: 8px;">
                                <div class="logo-title">AZHAR</div>
                                <div class="logo-subtitle">AZHAR COLLECTION</div>
                            </td>
                            <td style="border-left: 1px solid #1e3a8a; padding-left: 8px;">
                                <div class="address-box">
                                    a : Damarsi Rt.03 Rw.01 Buduran-Sidoarjo<br>
                                    e : email: azharcollection@gmail.com<br>
                                    p : Telp/Hp: 081330666807 (Ach. Haris) / 087855476538
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
                <td style="width: 45%; text-align: right; vertical-align: top;">
                    <div style="display: inline-block; text-align: left; font-size: 10px; line-height: 1.2;">
                        <div style="margin-bottom: 1px;">Sidoarjo, {{ date('d F Y', strtotime($invoice->order_date)) }}</div>
                        Kepada yang Terhormat: <span>{{ $invoice->customer_name }}</span><br>
                        No. Telp/HP : <span>{{ $invoice->customer->phone ?? '-' }}</span>
                    </div>
                </td>
            </tr>
        </table>

        <table style="width: 100%; margin-bottom: 2px; margin-top: 1px;">
            <tr>
                <td style="width: 33%; vertical-align: bottom; font-weight: bold; font-size: 10.5px;">
                    Nota No : {{ $invoice->invoice_number }}
                </td>
                <td style="width: 34%; text-align: center; vertical-align: bottom; font-weight: bold; font-size: 13px; letter-spacing: 1px;">
                    INVOICE
                </td>
                <td style="width: 33%;"></td>
            </tr>
        </table>

        <table class="master-table">
            <thead>
                <tr>
                    <th style="width: 10%;">Banyak</th>
                    <th style="width: 50%;">Nama Produk</th>
                    <th style="width: 20%;">Harga Satuan</th>
                    <th style="width: 20%;">Jumlah</th>
                </tr>
            </thead>
            <tbody>
                @foreach($pageItems as $item)
                <tr>
                    <td class="cell text-center" style="height: 7.2mm;">{{ $item->qty }}</td>
                    <td class="cell" style="height: 7.2mm;">
                        <div class="row-holder">
                            <strong>{{ $item->item_name }}</strong>
                            @php
                                $sizes = [];
                                if ($item->size_breakdown) {
                                    $breakdown = is_string($item->size_breakdown) ? json_decode($item->size_breakdown, true) : $item->size_breakdown;
                                    if (is_array($breakdown)) {
                                        foreach ($breakdown as $k => $v) {
                                            if (is_array($v) && isset($v['qty']) && $v['qty'] > 0) {
                                                $price = isset($v['price']) ? $v['price'] : $item->unit_price;
                                                $sizes[] = $k . '('.$v['qty'].' x '.number_format($price, 0, ',', '.').')';
                                            } elseif (is_numeric($v) && $v > 0) {
                                                $sizes[] = $k . '('.$v.' x '.number_format($item->unit_price, 0, ',', '.').')';
                                            }
                                        }
                                    }
                                }
                            @endphp
                            @if(!empty($sizes))
                                <span style="font-size: 8.5px; display: block; margin-top: 1px; color: #475569;">({{ implode(', ', $sizes) }})</span>
                            @endif
                        </div>
                    </td>
                    <td class="cell text-right" style="height: 7.2mm;">{{ number_format($item->unit_price, 0, ',', '.') }}</td>
                    <td class="cell text-right font-bold" style="height: 7.2mm;">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach

                @php
                    $itemCount = count($pageItems);
                    $emptyRows = $totalRows - $itemCount;
                    if ($emptyRows < 0) $emptyRows = 0;
                @endphp

                @for($i = 0; $i < $emptyRows; $i++)
                <tr>
                    <td class="cell text-center" style="height: 7.2mm;"><div class="row-holder">&nbsp;</div></td>
                    <td class="cell" style="height: 7.2mm;"><div class="row-holder">&nbsp;</div></td>
                    <td class="cell text-right" style="height: 7.2mm;"><div class="row-holder">&nbsp;</div></td>
                    <td class="cell text-right" style="height: 7.2mm;"><div class="row-holder">&nbsp;</div></td>
                </tr>
                @endfor

                <tr style="height: 8mm;">
                    <td colspan="2" rowspan="3" style="border: none; vertical-align: bottom; text-align: center; padding-bottom: 3px;">
                        <div style="display: inline-block; width: 45%; font-weight: bold; font-size: 10.5px; padding-top: 8px;">
                            <br>Tanda Terima<br><br><br><br><br>
                            ( ___________________ )
                        </div>
                        <div style="display: inline-block; width: 45%; font-weight: bold; font-size: 10.5px; padding-top: 8px;">
                            <br>Hormat Kami<br><br><br><br><br>
                            ( ___________________ )
                        </div>
                    </td>
                    <td class="cell text-center font-bold" style="vertical-align: middle; font-size: 10.5px; padding: 2.5px; height: 8mm;">TOTAL</td>
                    <td class="cell text-right font-bold" style="vertical-align: middle; font-size: 10.5px; padding: 2.5px; height: 8mm;">{{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                </tr>
                <tr style="height: 8mm;">
                    <td class="cell text-center font-bold" style="vertical-align: middle; font-size: 10px; padding: 2px; height: 8mm;">Uang Muka</td>
                    <td class="cell text-right" style="vertical-align: middle; font-size: 10px; padding: 2px; height: 8mm;">{{ number_format($invoice->paid_amount, 0, ',', '.') }}</td>
                </tr>
                <tr style="height: 8mm;">
                    @php $sisa = $invoice->total_amount - $invoice->paid_amount; @endphp
                    <td class="cell text-center font-bold" style="vertical-align: middle; font-size: 10px; padding: 2px; height: 8mm;">Kekurangan</td>
                    <td class="cell text-right" style="vertical-align: middle; font-size: 10px; padding: 2px; height: 8mm;">{{ number_format($sisa > 0 ? $sisa : 0, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>

        <div style="text-align: right; font-size: 8.5px; color: #1e3a8a; margin-top: 1px;">
            Halaman {{ $pageIndex + 1 }} dari {{ $totalPages }}
        </div>

    </div>
    @endforeach
</body>
</html>
