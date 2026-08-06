<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('items', function (Blueprint $table) {
            if (!Schema::hasColumn('items', 'real_stock')) {
                $table->integer('real_stock')->default(0)->after('stock');
            }
            if (!Schema::hasColumn('items', 'estimated_stock')) {
                $table->integer('estimated_stock')->default(0)->after('real_stock');
            }
        });

        // Initialize existing rows
        DB::table('items')->get()->each(function ($item) {
            if ($item->is_estimated_stock) {
                DB::table('items')->where('id', $item->id)->update([
                    'real_stock' => 0,
                    'estimated_stock' => $item->stock,
                ]);
            } else {
                DB::table('items')->where('id', $item->id)->update([
                    'real_stock' => $item->stock,
                    'estimated_stock' => 0,
                ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->dropColumn(['real_stock', 'estimated_stock']);
        });
    }
};
