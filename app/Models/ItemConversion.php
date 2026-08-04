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
    ];

    protected $casts = [
        'multiplier' => 'integer',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
