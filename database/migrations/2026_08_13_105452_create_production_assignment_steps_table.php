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
        Schema::create('production_assignment_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('production_assignment_id');
            $table->unsignedBigInteger('production_step_id')->nullable(); // From master product step
            $table->string('step_name'); // e.g. "Potong", "Jahit"
            $table->decimal('wage', 15, 2)->default(0); // Wage for this specific step
            $table->string('status')->default('PENDING'); // PENDING, SELESAI
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('production_assignment_id', 'fk_prod_assign_id')->references('id')->on('production_assignments')->onDelete('cascade');
            $table->foreign('production_step_id', 'fk_prod_step_id')->references('id')->on('production_steps')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_assignment_steps');
    }
};
