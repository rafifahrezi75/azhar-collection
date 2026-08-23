<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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
    }
}
