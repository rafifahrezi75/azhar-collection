<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemConversion extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'unit_id',
        'multiplier',
        'real_stock',
        'estimated_stock',
        'stock',
    ];

    protected $casts = [
        'multiplier' => 'integer',
        'real_stock' => 'integer',
        'estimated_stock' => 'integer',
        'stock' => 'integer',
    ];

    protected static function booted()
    {
        static::saving(function ($conv) {
            $conv->real_stock = max(0, (int) ($conv->real_stock ?? 0));
            $conv->estimated_stock = max(0, (int) ($conv->estimated_stock ?? 0));
            $conv->stock = $conv->real_stock + $conv->estimated_stock;
        });
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
