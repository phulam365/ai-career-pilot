<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardRoadmapRequest;
use App\Http\Requests\RoadmapProgressRequest;
use App\Services\CvTextExtractor;
use App\Services\OpenAiWebJobMatchService;
use App\Services\VietnamJobMatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CareerMatchController extends Controller
{
    public function __construct(
        private CvTextExtractor $cvTextExtractor,
        private VietnamJobMatchService $vietnamJobMatchService,
        private OpenAiWebJobMatchService $openAiWebJobMatchService,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('career-match', [
            'analysis' => $request->session()->get('career_match_analysis'),
            'careerMatchRoadmap' => $request->session()->get('career_match_roadmap'),
            'openAiConfigured' => $this->openAiWebJobMatchService->isConfigured(),
            'targetRoles' => $this->targetRoles(),
        ]);
    }

    public function analyze(Request $request): Response
    {
        $validated = $request->validate([
            'cv' => ['required', 'file', 'max:5120', 'mimes:pdf,docx,txt'],
            'target_role' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:120'],
            'match_mode' => ['nullable', Rule::in(['fast_demo', 'live_openai'])],
        ]);

        /** @var UploadedFile $file */
        $file = $request->file('cv');

        try {
            $cvText = $this->cvTextExtractor->extract($file);
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'cv' => $exception->getMessage(),
            ]);
        }

        if (str_word_count($cvText) < 40) {
            throw ValidationException::withMessages([
                'cv' => 'The uploaded CV was readable, but it does not contain enough text to match jobs reliably.',
            ]);
        }

        $matchMode = $validated['match_mode'] ?? 'fast_demo';

        try {
            $analysis = $matchMode === 'live_openai'
                ? $this->openAiWebJobMatchService->analyze(
                    cvText: $cvText,
                    filename: $file->getClientOriginalName(),
                    targetRole: $validated['target_role'] ?? null,
                    location: $validated['location'] ?? null,
                )
                : $this->vietnamJobMatchService->analyze(
                    cvText: $cvText,
                    filename: $file->getClientOriginalName(),
                    targetRole: $validated['target_role'] ?? null,
                    location: $validated['location'] ?? null,
                );
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'match_mode' => $exception->getMessage(),
            ]);
        }

        $request->session()->put('career_match_analysis', $analysis);
        $request->session()->forget('career_match_roadmap');

        return Inertia::render('career-match', [
            'analysis' => $analysis,
            'careerMatchRoadmap' => null,
            'openAiConfigured' => $this->openAiWebJobMatchService->isConfigured(),
            'targetRoles' => $this->targetRoles(),
        ]);
    }

    public function roadmap(DashboardRoadmapRequest $request): RedirectResponse
    {
        $analysis = $request->session()->get('career_match_analysis');

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

        $request->session()->put('career_match_roadmap', [
            'job_id' => $job['id'],
            'roadmap' => $roadmap,
        ]);

        return to_route('career-match.index');
    }

    public function roadmapProgress(RoadmapProgressRequest $request): RedirectResponse
    {
        $storedRoadmap = $request->session()->get('career_match_roadmap');
        $validated = $request->validated();

        if (! is_array($storedRoadmap) || ($storedRoadmap['job_id'] ?? null) !== $validated['job_id']) {
            throw ValidationException::withMessages([
                'job_id' => 'Generate a roadmap before submitting progress.',
            ]);
        }

        $storedRoadmap['completed_steps'] = $this->completedStepIndexes($validated['completed_steps'] ?? []);
        $storedRoadmap['progress_action'] = $validated['action'];

        $request->session()->put('career_match_roadmap', $storedRoadmap);
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $validated['action'] === 'update_cv'
                ? __('Roadmap progress saved for CV update.')
                : __('Roadmap progress submitted.'),
        ]);

        return to_route('career-match.index');
    }

    /**
     * @return array<int, string>
     */
    private function targetRoles(): array
    {
        return [
            'Auto-detect',
            ...$this->vietnamJobMatchService->targetRoles(),
        ];
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
