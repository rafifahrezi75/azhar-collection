<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add usage_unit and conversion_rate to items table
        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'usage_unit')) {
                $table->string('usage_unit')->nullable()->after('unit_id');
            }
            if (!Schema::hasColumn('items', 'conversion_rate')) {
                $table->decimal('conversion_rate', 12, 4)->default(1.0000)->after('usage_unit');
            }
        });

        // 2. Add yield_qty to product_materials table (BOM)
        Schema::table('product_materials', function (Blueprint $table) {
            if (!Schema::hasColumn('product_materials', 'yield_qty')) {
                $table->decimal('yield_qty', 10, 4)->default(1.0000)->after('required_qty');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_materials', function (Blueprint $table) {
            if (Schema::hasColumn('product_materials', 'yield_qty')) {
                $table->dropColumn('yield_qty');
            }
        });

        Schema::table('items', function (Blueprint $table) {
            if (Schema::hasColumn('items', 'conversion_rate')) {
                $table->dropColumn('conversion_rate');
            }
            if (Schema::hasColumn('items', 'usage_unit')) {
                $table->dropColumn('usage_unit');
            }
        });
    }
};
