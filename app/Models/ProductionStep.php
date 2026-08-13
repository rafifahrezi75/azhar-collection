<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductionStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
        'name',
        'default_wage',
        'description',
    ];

    protected $casts = [
        'default_wage' => 'decimal:2',
    ];
}
