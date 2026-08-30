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
        Schema::create('invoice_item_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('invoice_item_id')->constrained('invoice_items')->onDelete('cascade');
            $table->unsignedBigInteger('item_id')->constrained('items')->onDelete('restrict');
            $table->string('item_name')->nullable();
            $table->decimal('required_qty', 10, 4)->default(1);
            $table->decimal('yield_qty', 10, 4)->default(1.0000);
            $table->decimal('conversion_rate', 12, 4)->default(1.0000);
            $table->string('unit_name')->nullable();
            $table->integer('qty_used')->default(0); // qty final yang dipakai untuk potong stok
            $table->unsignedBigInteger('size_id')->nullable()->constrained('sizes')->onDelete('cascade');
            $table->timestamps();

            $table->index(['invoice_item_id', 'item_id', 'size_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_item_materials');
    }
};
