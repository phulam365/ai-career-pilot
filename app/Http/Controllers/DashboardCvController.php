<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardCvUploadRequest;
use App\Http\Requests\DashboardRoadmapRequest;
use App\Http\Requests\RoadmapProgressRequest;
use App\Services\CvTextExtractor;
use App\Services\OpenAiWebJobMatchService;
use App\Services\VietnamJobMatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardCvController extends Controller
{
    public function __construct(
        private CvTextExtractor $cvTextExtractor,
        private OpenAiWebJobMatchService $openAiWebJobMatchService,
        private VietnamJobMatchService $vietnamJobMatchService,
    ) {}

    /**
     * Store or replace the authenticated user's CV.
     */
    public function store(DashboardCvUploadRequest $request): RedirectResponse
    {
        $user = $request->user();
        $previousCvPath = $user->cv_path;
        $file = $request->file('cv');

        $path = $file->store('cvs/'.$user->id, 'local');

        $user->forceFill([
            'cv_path' => $path,
            'cv_original_name' => $file->getClientOriginalName(),
        ])->save();

        if (filled($previousCvPath) && $previousCvPath !== $path) {
            Storage::disk('local')->delete($previousCvPath);
        }

        $request->session()->forget(['dashboard_cv_analysis', 'dashboard_cv_match_error', 'dashboard_cv_roadmap']);

        try {
            $cvText = $this->cvTextExtractor->extract($file);

            if (str_word_count($cvText) < 40) {
                throw new RuntimeException('The uploaded CV was readable, but it does not contain enough text to match jobs reliably.');
            }

            $analysis = $this->openAiWebJobMatchService->isConfigured()
                ? $this->openAiWebJobMatchService->analyze(
                    cvText: $cvText,
                    filename: $file->getClientOriginalName(),
                    targetRole: null,
                    location: 'Vietnam',
                )
                : $this->vietnamJobMatchService->analyze(
                    cvText: $cvText,
                    filename: $file->getClientOriginalName(),
                    targetRole: null,
                    location: 'Vietnam',
                );

            $request->session()->put('dashboard_cv_analysis', [
                ...$analysis,
                'results' => array_slice($analysis['results'], 0, 3),
            ]);
        } catch (RuntimeException $exception) {
            $request->session()->put('dashboard_cv_match_error', $exception->getMessage());
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('CV uploaded.')]);

        return to_route('dashboard');
    }

    public function roadmap(DashboardRoadmapRequest $request): RedirectResponse
    {
        $analysis = $request->session()->get('dashboard_cv_analysis');

        if (! is_array($analysis)) {
            throw ValidationException::withMessages([
                'job_id' => 'Upload a CV and generate matches before creating a roadmap.',
            ]);
        }

        $job = $this->findJobById($analysis['results'] ?? [], (string) $request->validated('job_id'));

        if (! is_array($job)) {
            throw ValidationException::withMessages([
                'job_id' => 'The selected job match is no longer available.',
            ]);
        }

        try {
            $roadmap = $this->openAiWebJobMatchService->generateRoadmap($job);
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'job_id' => $exception->getMessage(),
            ]);
        }

        $request->session()->put('dashboard_cv_roadmap', [
            'job_id' => $job['id'],
            'roadmap' => $roadmap,
        ]);

        return to_route('dashboard');
    }

    public function roadmapProgress(RoadmapProgressRequest $request): RedirectResponse
    {
        $storedRoadmap = $request->session()->get('dashboard_cv_roadmap');
        $validated = $request->validated();

        if (! is_array($storedRoadmap) || ($storedRoadmap['job_id'] ?? null) !== $validated['job_id']) {
            throw ValidationException::withMessages([
                'job_id' => 'Generate a roadmap before submitting progress.',
            ]);
        }

        $storedRoadmap['completed_steps'] = $this->completedStepIndexes($validated['completed_steps'] ?? []);
        $storedRoadmap['progress_action'] = $validated['action'];

        $request->session()->put('dashboard_cv_roadmap', $storedRoadmap);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['action'] === 'update_cv'
                ? __('Roadmap progress saved for CV update.')
                : __('Roadmap progress submitted.'),
        ]);

        return to_route('dashboard');
    }

    /**
     * Download the authenticated user's private CV.
     */
    public function download(Request $request): StreamedResponse
    {
        $user = $request->user();

        abort_if(blank($user->cv_path) || blank($user->cv_original_name), 404);
        abort_unless(Storage::disk('local')->exists($user->cv_path), 404);

        return Storage::disk('local')->download($user->cv_path, $user->cv_original_name);
    }

    /**
     * @return array<int, int>
     */
    private function completedStepIndexes(mixed $indexes): array
    {
        if (! is_array($indexes)) {
            return [];
        }

        return array_values(array_unique(array_map('intval', $indexes)));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function findJobById(mixed $results, string $jobId): ?array
    {
        if (! is_array($results)) {
            return null;
        }

        foreach ($results as $result) {
            if (is_array($result) && ($result['id'] ?? null) === $jobId) {
                return $result;
            }
        }

        return null;
    }
}
