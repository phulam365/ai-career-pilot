<?php

namespace App\Http\Controllers;

use App\Services\CvTextExtractor;
use App\Services\OpenAiWebJobMatchService;
use App\Services\VietnamJobMatchService;
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

    public function index(): Response
    {
        return Inertia::render('career-match', [
            'analysis' => null,
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

        return Inertia::render('career-match', [
            'analysis' => $analysis,
            'openAiConfigured' => $this->openAiWebJobMatchService->isConfigured(),
            'targetRoles' => $this->targetRoles(),
        ]);
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
}
