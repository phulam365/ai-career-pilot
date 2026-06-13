<?php

namespace App\Http\Controllers;

use App\Services\OpenAiWebJobMatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private OpenAiWebJobMatchService $openAiWebJobMatchService,
    ) {}

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
            'dashboardMatchAnalysis' => $request->session()->get('dashboard_cv_analysis'),
            'dashboardMatchError' => $request->session()->get('dashboard_cv_match_error'),
            'dashboardRoadmap' => $request->session()->get('dashboard_cv_roadmap'),
            'openAiConfigured' => $this->openAiWebJobMatchService->isConfigured(),
        ]);
    }
}
