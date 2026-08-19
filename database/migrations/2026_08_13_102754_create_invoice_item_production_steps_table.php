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
        Schema::create('invoice_item_production_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('invoice_item_id');
            $table->unsignedBigInteger('production_step_id')->nullable();
            $table->string('step_name');
            $table->decimal('wage', 15, 2)->default(0);
            $table->integer('step_order')->default(0);
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->string('status')->default('PENDING'); // PENDING, IN_PROGRESS, SELESAI
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('invoice_item_id')->references('id')->on('invoice_items')->onDelete('cascade');
            $table->foreign('production_step_id')->references('id')->on('production_steps')->onDelete('set null');
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_item_production_steps');
    }
};
