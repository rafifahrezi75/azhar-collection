<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category_id',
        'unit_id',
        'stock',
        'min_stock',
        'image',
        'description',
        'is_active',
    ];

    protected $casts = [
        'stock' => 'integer',
        'min_stock' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'image_url',
        'stock_breakdown_text',
        'all_units',
        'unit_stock_summary',
    ];

    public function getImageUrlAttribute(): ?string
    {
        if ($this->image) {
            return Storage::disk('public')->url($this->image);
        }
        return null;
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function conversions()
    {
        return $this->hasMany(ItemConversion::class)->with('unit');
    }

    public function mutations()
    {
        return $this->hasMany(StockMutation::class)->with(['unit', 'user'])->latest('mutation_date');
    }

    /**
     * Compute multi-unit hierarchical breakdown of current stock
     */
    public function getStockBreakdownAttribute(): array
    {
        $conversions = $this->relationLoaded('conversions')
            ? $this->conversions
            : $this->conversions()->with('unit')->get();

        $sortedConversions = $conversions->sortByDesc('multiplier');
        $remaining = max(0, (int) $this->stock);
        $breakdown = [];

        foreach ($sortedConversions as $conv) {
            if ($conv->multiplier > 1) {
                $count = intdiv($remaining, $conv->multiplier);
                $remaining = $remaining % $conv->multiplier;
                $breakdown[] = [
                    'unit_id' => $conv->unit_id,
                    'unit_name' => $conv->unit ? $conv->unit->name : 'Unit',
                    'unit_symbol' => $conv->unit ? ($conv->unit->symbol ?: $conv->unit->name) : 'Unit',
                    'multiplier' => $conv->multiplier,
                    'count' => $count,
                ];
            }
        }

        $baseUnitName = $this->unit ? $this->unit->name : 'Pcs';
        $baseUnitSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';

        $breakdown[] = [
            'unit_id' => $this->unit_id,
            'unit_name' => $baseUnitName,
            'unit_symbol' => $baseUnitSymbol,
            'multiplier' => 1,
            'count' => $remaining,
            'is_base' => true,
        ];

        return $breakdown;
    }

    /**
     * Human-friendly text representation of multi-unit stock (e.g. "1 Pack, 5 Pcs")
     */
    public function getStockBreakdownTextAttribute(): string
    {
        $breakdowns = $this->getStockBreakdownAttribute();
        $parts = [];

        foreach ($breakdowns as $b) {
            if ($b['count'] > 0 || (empty($parts) && !empty($b['is_base']))) {
                $parts[] = "{$b['count']} {$b['unit_symbol']}";
            }
        }

        if (empty($parts)) {
            $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
            return "0 {$baseSymbol}";
        }

        return implode(', ', $parts);
    }

    /**
     * Summary of stock representation in EVERY registered unit for this item
     */
    public function getUnitStockSummaryAttribute(): array
    {
        $summaries = [];
        $totalBase = max(0, (int) $this->stock);
        $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
        $baseName = $this->unit ? $this->unit->name : 'Satuan Dasar';

        // 1. Base Unit Stock
        $summaries[] = [
            'unit_id' => $this->unit_id,
            'unit_name' => $baseName,
            'unit_symbol' => $baseSymbol,
            'multiplier' => 1,
            'is_base' => true,
            'full_count' => $totalBase,
            'remainder' => 0,
            'decimal_count' => (float) $totalBase,
            'display_text' => "{$totalBase} {$baseSymbol}",
            'detail_text' => "Total Satuan Dasar ({$baseName})",
        ];

        // 2. Conversion Units Stock
        $conversions = $this->relationLoaded('conversions')
            ? $this->conversions
            : $this->conversions()->with('unit')->get();

        $sortedConversions = $conversions->sortByDesc('multiplier');

        foreach ($sortedConversions as $conv) {
            if ($conv->unit && $conv->multiplier > 1) {
                $sym = $conv->unit->symbol ?: $conv->unit->name;
                $fullCount = intdiv($totalBase, (int) $conv->multiplier);
                $rem = $totalBase % (int) $conv->multiplier;
                $dec = round($totalBase / (int) $conv->multiplier, 2);

                $text = "{$fullCount} {$sym}";
                if ($rem > 0) {
                    $text .= " (sisa {$rem} {$baseSymbol})";
                }

                $summaries[] = [
                    'unit_id' => $conv->unit_id,
                    'unit_name' => $conv->unit->name,
                    'unit_symbol' => $sym,
                    'multiplier' => (int) $conv->multiplier,
                    'is_base' => false,
                    'full_count' => $fullCount,
                    'remainder' => $rem,
                    'decimal_count' => $dec,
                    'display_text' => $text,
                    'detail_text' => "1 {$sym} = {$conv->multiplier} {$baseSymbol} (Total: {$dec} {$sym})",
                ];
            }
        }

        return $summaries;
    }

    /**
     * Array of all selectable units for this item (Base unit + all conversions)
     */
    public function getAllUnitsAttribute(): array
    {
        $units = [];
        
        // Base Unit
        if ($this->unit) {
            $units[] = [
                'unit_id' => $this->unit_id,
                'name' => $this->unit->name,
                'symbol' => $this->unit->symbol ?: $this->unit->name,
                'multiplier' => 1,
                'is_base' => true,
                'label' => ($this->unit->symbol ?: $this->unit->name) . ' (Satuan Dasar)',
            ];
        }

        // Conversions
        $conversions = $this->relationLoaded('conversions')
            ? $this->conversions
            : $this->conversions()->with('unit')->get();

        foreach ($conversions as $conv) {
            if ($conv->unit) {
                $sym = $conv->unit->symbol ?: $conv->unit->name;
                $baseSym = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : '';
                $units[] = [
                    'unit_id' => $conv->unit_id,
                    'name' => $conv->unit->name,
                    'symbol' => $sym,
                    'multiplier' => (int) $conv->multiplier,
                    'is_base' => false,
                    'label' => "{$conv->unit->name} ({$sym}) = {$conv->multiplier} {$baseSym}",
                ];
            }
        }

        return $units;
    }
}
