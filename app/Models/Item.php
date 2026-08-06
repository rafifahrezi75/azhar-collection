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
        'real_stock',
        'estimated_stock',
        'is_estimated_stock',
        'min_stock',
        'image',
        'description',
        'is_active',
    ];

    protected $casts = [
        'stock' => 'integer',
        'real_stock' => 'integer',
        'estimated_stock' => 'integer',
        'is_estimated_stock' => 'boolean',
        'min_stock' => 'integer',
        'is_active' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($item) {
            $item->real_stock = max(0, (int) ($item->real_stock ?? 0));
            $item->estimated_stock = max(0, (int) ($item->estimated_stock ?? 0));

            // If item has no conversions relation yet, default stock to base unit stock
            if (! $item->exists || ! $item->conversions()->exists()) {
                $item->stock = $item->real_stock + $item->estimated_stock;
                $item->is_estimated_stock = $item->estimated_stock > 0;
            }
        });
    }

    protected $appends = [
        'image_url',
        'stock_breakdown',
        'stock_breakdown_text',
        'real_stock_breakdown',
        'real_stock_breakdown_text',
        'estimated_stock_breakdown',
        'estimated_stock_breakdown_text',
        'dual_stock_breakdown_text',
        'unit_cards',
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
     * Compute multi-unit breakdown based directly on independent physical unit records
     */
    public function getBreakdownForQuantity(int $quantity): array
    {
        return $this->unit_cards;
    }

    /**
     * Format a breakdown array into human-readable string
     */
    public function formatBreakdownText(array $breakdowns): string
    {
        $parts = [];
        foreach ($breakdowns as $b) {
            $count = $b['total_count'] ?? $b['count'] ?? 0;
            $sym = $b['unit_symbol'] ?? '';
            if ($count > 0) {
                $parts[] = "{$count} {$sym}";
            }
        }

        if (empty($parts)) {
            $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
            return "0 {$baseSymbol}";
        }

        return implode(' + ', $parts);
    }

    /**
     * Compute multi-unit breakdown of current total stock
     */
    public function getStockBreakdownAttribute(): array
    {
        return $this->unit_cards;
    }

    /**
     * Compute multi-unit breakdown of real stock
     */
    public function getRealStockBreakdownAttribute(): array
    {
        return array_values(array_filter($this->unit_cards, function ($c) {
            return ($c['real_count'] ?? 0) > 0;
        }));
    }

    /**
     * Human-friendly text representation of real stock (e.g. "2 Roll + 50 m")
     */
    public function getRealStockBreakdownTextAttribute(): string
    {
        $parts = [];
        foreach ($this->unit_cards as $c) {
            $real = $c['real_count'] ?? 0;
            if ($real > 0) {
                $parts[] = "{$real} {$c['unit_symbol']}";
            }
        }

        if (empty($parts)) {
            $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
            return "0 {$baseSymbol}";
        }

        return implode(' + ', $parts);
    }

    /**
     * Compute multi-unit breakdown of estimated stock
     */
    public function getEstimatedStockBreakdownAttribute(): array
    {
        return array_values(array_filter($this->unit_cards, function ($c) {
            return ($c['est_count'] ?? 0) > 0;
        }));
    }

    /**
     * Human-friendly text representation of estimated stock (e.g. "1 Roll + 15 m")
     */
    public function getEstimatedStockBreakdownTextAttribute(): string
    {
        $parts = [];
        foreach ($this->unit_cards as $c) {
            $est = $c['est_count'] ?? 0;
            if ($est > 0) {
                $parts[] = "{$est} {$c['unit_symbol']}";
            }
        }

        if (empty($parts)) {
            $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
            return "0 {$baseSymbol}";
        }

        return implode(' + ', $parts);
    }

    /**
     * Dedicated unit breakdown cards for frontend UI (e.g. Card for Roll, Card for Meter)
     * Tracks each unit independently without automatic force-conversion.
     */
    public function getUnitCardsAttribute(): array
    {
        $cards = [];
        $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
        $baseName = $this->unit ? $this->unit->name : 'Satuan Dasar';

        $conversions = $this->relationLoaded('conversions')
            ? $this->conversions
            : $this->conversions()->with('unit')->get();

        $sortedConversions = $conversions->sortByDesc('multiplier');

        foreach ($sortedConversions as $conv) {
            if ($conv->unit) {
                $mult = (int) $conv->multiplier;
                $realCount = (int) ($conv->real_stock ?? 0);
                $estCount = (int) ($conv->estimated_stock ?? 0);
                $totalCount = $realCount + $estCount;
                $sym = $conv->unit->symbol ?: $conv->unit->name;

                $cards[] = [
                    'unit_id' => $conv->unit_id,
                    'unit_name' => $conv->unit->name,
                    'unit_symbol' => $sym,
                    'multiplier' => $mult,
                    'is_base' => false,
                    'real_count' => $realCount,
                    'est_count' => $estCount,
                    'total_count' => $totalCount,
                    'real_text' => "{$realCount} {$sym}",
                    'est_text' => "{$estCount} {$sym}",
                    'total_text' => "{$totalCount} {$sym}",
                    'equivalent_text' => ($totalCount * $mult) . " {$baseSymbol}",
                    'multiplier_label' => "1 {$sym} = {$mult} {$baseSymbol}",
                ];
            }
        }

        // Base Unit Card directly from item's own real_stock and estimated_stock
        $baseReal = (int) ($this->real_stock ?? 0);
        $baseEst = (int) ($this->estimated_stock ?? 0);
        $baseTotal = $baseReal + $baseEst;

        $cards[] = [
            'unit_id' => $this->unit_id,
            'unit_name' => $baseName,
            'unit_symbol' => $baseSymbol,
            'multiplier' => 1,
            'is_base' => true,
            'real_count' => $baseReal,
            'est_count' => $baseEst,
            'total_count' => $baseTotal,
            'real_text' => "{$baseReal} {$baseSymbol}",
            'est_text' => "{$baseEst} {$baseSymbol}",
            'total_text' => "{$baseTotal} {$baseSymbol}",
            'equivalent_text' => "{$baseTotal} {$baseSymbol}",
            'multiplier_label' => "Satuan Dasar (@1)",
        ];

        return $cards;
    }

    /**
     * Combined Dual-Stock Text (e.g. "2 Roll (Nyata) + 1 Roll (Estimasi) + 60 m (Nyata)")
     */
    public function getDualStockBreakdownTextAttribute(): string
    {
        $cards = $this->unit_cards;
        $parts = [];

        foreach ($cards as $c) {
            $real = $c['real_count'];
            $est = $c['est_count'];
            $sym = $c['unit_symbol'];

            if ($real > 0 && $est > 0) {
                $parts[] = "{$real} {$sym} (Nyata) + {$est} {$sym} (Estimasi)";
            } elseif ($real > 0) {
                $parts[] = "{$real} {$sym} (Nyata)";
            } elseif ($est > 0) {
                $parts[] = "{$est} {$sym} (Estimasi)";
            }
        }

        if (empty($parts)) {
            $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
            return "0 {$baseSymbol}";
        }

        return implode(' + ', $parts);
    }

    /**
     * Combined Stock Breakdown Text (e.g. "2 Roll + 60 m")
     */
    public function getStockBreakdownTextAttribute(): string
    {
        $cards = $this->unit_cards;
        $parts = [];

        foreach ($cards as $c) {
            $total = $c['total_count'];
            $sym = $c['unit_symbol'];
            if ($total > 0) {
                $parts[] = "{$total} {$sym}";
            }
        }

        if (empty($parts)) {
            $baseSymbol = $this->unit ? ($this->unit->symbol ?: $this->unit->name) : 'pcs';
            return "0 {$baseSymbol}";
        }

        return implode(' + ', $parts);
    }

    public function recalculateTotalStock(): void
    {
        $conversions = $this->conversions()->get();
        $totalConvBase = 0;
        $totalConvEst = 0;

        foreach ($conversions as $conv) {
            $mult = (int) $conv->multiplier;
            $real = (int) ($conv->real_stock ?? 0);
            $est = (int) ($conv->estimated_stock ?? 0);
            $totalConvEst += $est * $mult;
            $totalConvBase += ($real + $est) * $mult;
        }

        $baseReal = (int) ($this->real_stock ?? 0);
        $baseEst = (int) ($this->estimated_stock ?? 0);

        $this->stock = $totalConvBase + $baseReal + $baseEst;
        $this->is_estimated_stock = ($totalConvEst + $baseEst) > 0;
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
