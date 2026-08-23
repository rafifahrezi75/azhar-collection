<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionAssignmentStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_assignment_id',
        'production_step_id',
        'step_name',
        'wage',
        'qty',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(ProductionAssignment::class, 'production_assignment_id');
    }

    public function productionStep(): BelongsTo
    {
        return $this->belongsTo(ProductionStep::class, 'production_step_id');
    }

    public function progressLogs(): HasMany
    {
        return $this->hasMany(ProductionProgressLog::class, 'production_assignment_step_id');
    }
}
