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
        Schema::table('product_production_steps', function (Blueprint $table) {
            $table->unsignedBigInteger('production_step_id')->nullable()->change();
            $table->string('custom_name')->nullable()->after('production_step_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('product_production_steps', function (Blueprint $table) {
            //
        });
    }
};
