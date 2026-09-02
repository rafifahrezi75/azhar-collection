<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        $this->call([
            AccessSeeder::class,
            TailorSeeder::class,
            SchoolSeeder::class,
            RawMaterialSeeder::class,
            CustomerSeeder::class,
            ProductionStepSeeder::class,
            SizeSeeder::class,
            ProductSeeder::class,
            MenuUpdateSeeder::class,
            TransactionSeeder::class,
            PurchaseSeeder::class,
            ProductionAssignmentSeeder::class,
            ProductionProgressSeeder::class,
        ]);

        Schema::enableForeignKeyConstraints();
    }
}
