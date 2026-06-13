<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the authenticated user's dashboard.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();

        $hasCv = filled($user->cv_path)
            && filled($user->cv_original_name)
            && Storage::disk('local')->exists($user->cv_path);

        return Inertia::render('dashboard', [
            'hasCv' => $hasCv,
            'cvOriginalName' => $hasCv ? $user->cv_original_name : null,
        ]);
    }
}
