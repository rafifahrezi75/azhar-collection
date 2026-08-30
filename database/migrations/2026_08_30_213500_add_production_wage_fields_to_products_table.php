<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('production_wage_mode', 20)->default('steps')->after('base_price');
            $table->decimal('production_wage', 15, 2)->default(0)->after('production_wage_mode');
        });

        DB::table('products')
            ->select('id')
            ->orderBy('id')
            ->chunkById(100, function ($products) {
                foreach ($products as $product) {
                    $totalWage = DB::table('product_production_steps')
                        ->where('product_id', $product->id)
                        ->sum('wage');

                    DB::table('products')
                        ->where('id', $product->id)
                        ->update([
                            'production_wage_mode' => 'steps',
                            'production_wage' => $totalWage,
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'production_wage_mode',
                'production_wage',
            ]);
        });
    }
};
