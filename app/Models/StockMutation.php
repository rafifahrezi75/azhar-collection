<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMutation extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'user_id',
        'type',
        'quantity',
        'unit_id',
        'multiplier',
        'total_base_quantity',
        'previous_stock',
        'current_stock',
        'notes',
        'reference_no',
        'mutation_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'multiplier' => 'integer',
        'total_base_quantity' => 'integer',
        'previous_stock' => 'integer',
        'current_stock' => 'integer',
        'mutation_date' => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
