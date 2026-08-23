<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductionProgressLog extends Model
{
    protected $fillable = [
        'production_assignment_step_id',
        'user_id',
        'date',
        'qty',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function assignmentStep(): BelongsTo
    {
        return $this->belongsTo(ProductionAssignmentStep::class, 'production_assignment_step_id');
    }

    public function tailor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
