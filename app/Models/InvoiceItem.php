<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'item_name',
        'unit',
        'qty',
        'unit_price',
        'subtotal',
        'size_breakdown',
        'description',
    ];

    protected $casts = [
        'qty' => 'integer',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'size_breakdown' => 'array',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productionSteps(): HasMany
    {
        return $this->hasMany(InvoiceItemProductionStep::class);
    }

    public function productionAssignments(): HasMany
    {
        return $this->hasMany(ProductionAssignment::class);
    }
}
