<?php

use App\Http\Controllers\AuthUserController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\HakAksesController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/me', [AuthUserController::class, 'me']);

    Route::get('/categories', [CategoryController::class, 'index'])
        ->middleware('permission:kategori.view');

    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('permission:kategori.create');

    Route::put('/categories/{category}', [CategoryController::class, 'update'])
        ->middleware('permission:kategori.update');

    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])
        ->middleware('permission:kategori.delete');

    Route::get('/hak-akses', [HakAksesController::class, 'index'])
        ->middleware('permission:hak_akses.view');

    Route::put('/hak-akses/{role}', [HakAksesController::class, 'update'])
        ->middleware('permission:hak_akses.update');

    Route::get('/users-management', [UserManagementController::class, 'index'])
        ->middleware('permission:user.view');

    Route::put('/users-management/{user}/roles', [UserManagementController::class, 'updateRole'])
        ->middleware('permission:user.update');
});
