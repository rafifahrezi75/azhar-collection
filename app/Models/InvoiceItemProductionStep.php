<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItemProductionStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_item_id',
        'production_step_id',
        'step_name',
        'wage',
        'step_order',
        'assigned_to',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function invoiceItem()
    {
        return $this->belongsTo(InvoiceItem::class);
    }

    public function productionStep()
    {
        return $this->belongsTo(ProductionStep::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
