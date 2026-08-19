<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_item_id',
        'user_id',
        'qty',
        'target_date',
        'status',
    ];

    protected $casts = [
        'target_date' => 'date',
    ];

    public function invoiceItem(): BelongsTo
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(ProductionAssignmentStep::class);
    }
}
