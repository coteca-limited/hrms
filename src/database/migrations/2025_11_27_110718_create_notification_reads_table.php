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
        Schema::create('notification_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');              // leaves, birthdays, anniversary, complaints
            $table->unsignedBigInteger('ref_id')->nullable(); // leave_id / complaint_id (if needed)
            $table->timestamps();

            $table->unique(['user_id', 'type', 'ref_id']); // prevents duplicate
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
