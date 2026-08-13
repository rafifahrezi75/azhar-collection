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
        Schema::table('product_materials', function (Blueprint $table) {
            if (!Schema::hasColumn('product_materials', 'conversion_rate')) {
                $table->decimal('conversion_rate', 12, 4)->default(1.0000)->after('yield_qty');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_materials', function (Blueprint $table) {
            if (Schema::hasColumn('product_materials', 'conversion_rate')) {
                $table->dropColumn('conversion_rate');
            }
        });
    }
};
