<?php

use App\Http\Controllers\CareerMatchController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DashboardCvController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'show'])->name('dashboard');
    Route::post('dashboard/cv', [DashboardCvController::class, 'store'])->name('dashboard.cv.store');
    Route::get('dashboard/cv', [DashboardCvController::class, 'download'])->name('dashboard.cv.download');
    Route::post('dashboard/cv/roadmap', [DashboardCvController::class, 'roadmap'])->name('dashboard.cv.roadmap');
    Route::post('dashboard/cv/roadmap/progress', [DashboardCvController::class, 'roadmapProgress'])->name('dashboard.cv.roadmap.progress');
    Route::get('career-match', [CareerMatchController::class, 'index'])
        ->name('career-match.index');
    Route::post('career-match', [CareerMatchController::class, 'analyze'])
        ->name('career-match.analyze');
    Route::post('career-match/roadmap', [CareerMatchController::class, 'roadmap'])
        ->name('career-match.roadmap');
    Route::post('career-match/roadmap/progress', [CareerMatchController::class, 'roadmapProgress'])
        ->name('career-match.roadmap.progress');
});

require __DIR__.'/settings.php';
