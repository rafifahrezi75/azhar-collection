<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItemMaterial extends Model
{
    protected $fillable = [
        'invoice_item_id',
        'item_id',
        'item_name',
        'required_qty',
        'yield_qty',
        'conversion_rate',
        'unit_name',
        'qty_used',
        'size_id',
    ];
}
