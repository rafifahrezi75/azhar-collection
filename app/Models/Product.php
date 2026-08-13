<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category',
        'default_unit',
        'base_price',
        'description',
        'is_active',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'primary_image_url',
        'price_range',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class)->orderBy('sort_order')->orderBy('id');
    }

    public function materials(): HasMany
    {
        return $this->hasMany(ProductMaterial::class);
    }

    public function invoiceItems(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function productionSteps(): HasMany
    {
        return $this->hasMany(ProductProductionStep::class)->orderBy('sort_order')->orderBy('id');
    }

    public function getPrimaryImageUrlAttribute(): ?string
    {
        // Check if images relation is loaded
        if ($this->relationLoaded('images')) {
            $primary = $this->images->firstWhere('is_primary', true) ?: $this->images->first();
            return $primary ? $primary->image_url : null;
        }

        // Otherwise query
        $primary = $this->images()->where('is_primary', true)->first() ?: $this->images()->first();
        return $primary ? $primary->image_url : null;
    }

    public function getPriceRangeAttribute(): array
    {
        $base = (float)($this->base_price ?? 0);
        $sizes = $this->relationLoaded('sizes') ? $this->sizes : $this->sizes()->get();

        if ($sizes->isEmpty()) {
            return [
                'min' => $base,
                'max' => $base,
                'has_variants' => false,
            ];
        }

        $prices = $sizes->pluck('price')->map(fn($p) => (float)$p)->filter(fn($p) => $p > 0)->values();
        if ($prices->isEmpty()) {
            return [
                'min' => $base,
                'max' => $base,
                'has_variants' => false,
            ];
        }

        return [
            'min' => $prices->min(),
            'max' => $prices->max(),
            'has_variants' => true,
        ];
    }
}
