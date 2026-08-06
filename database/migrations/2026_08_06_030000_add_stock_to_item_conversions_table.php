<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('item_conversions', function (Blueprint $table) {
            $table->integer('real_stock')->default(0)->after('multiplier');
            $table->integer('estimated_stock')->default(0)->after('real_stock');
            $table->integer('stock')->default(0)->after('estimated_stock');
        });
    }

    public function down(): void
    {
        Schema::table('item_conversions', function (Blueprint $table) {
            $table->dropColumn(['real_stock', 'estimated_stock', 'stock']);
        });
    }
};
