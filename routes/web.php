<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardCvController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'show'])->name('dashboard');
    Route::post('dashboard/cv', [DashboardCvController::class, 'store'])->name('dashboard.cv.store');
    Route::get('dashboard/cv', [DashboardCvController::class, 'download'])->name('dashboard.cv.download');
});

require __DIR__.'/settings.php';
