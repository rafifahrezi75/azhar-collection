<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductProductionStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'production_step_id',
        'custom_name',
        'wage',
        'sort_order',
    ];

    protected $casts = [
        'wage' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productionStep()
    {
        return $this->belongsTo(ProductionStep::class);
    }
}
