<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class OpenAiWebJobMatchService
{
    /**
     * @return array{
     *     cv: array{filename: string, word_count: int, detected_skills: array<int, string>, target_role: string, location: string, match_mode: string},
     *     results: array<int, array<string, mixed>>,
     *     source_links: array<int, array{source: string, url: string, note: string}>
     * }
     */
    public function analyze(string $cvText, string $filename, ?string $targetRole = null, ?string $location = null): array
    {
        $apiKey = $this->apiKey();

        if ($apiKey === null) {
            throw new RuntimeException('OpenAI API key is missing. Add OPENAI_API_KEY to your local environment.');
        }

        $normalizedLocation = trim((string) $location) !== '' ? trim((string) $location) : 'Vietnam';
        $selectedRole = $targetRole !== null && trim($targetRole) !== '' && trim($targetRole) !== 'Auto-detect'
            ? trim($targetRole)
            : 'auto-detect';

        $payload = [
            'model' => $this->model(),
            'tools' => [
                [
                    'type' => 'web_search',
                    'search_context_size' => 'medium',
                    'filters' => [
                        'allowed_domains' => $this->allowedDomains(),
                    ],
                ],
            ],
            'tool_choice' => 'required',
            'input' => $this->prompt($this->compactText($cvText), $selectedRole, $normalizedLocation),
        ];

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.openai.timeout', 90))
            ->post('https://api.openai.com/v1/responses', $payload);

        if ($response->failed()) {
            throw new RuntimeException('OpenAI web search failed: '.$response->body());
        }

        $responsePayload = $response->json();
        $modelJson = $this->parseModelJson($this->outputText($responsePayload));

        if (! is_array($modelJson)) {
            throw new RuntimeException('OpenAI returned a response that could not be parsed as JSON.');
        }

        $results = [];
        $rawResults = is_array($modelJson['results'] ?? null) ? $modelJson['results'] : [];

        foreach (array_slice($rawResults, 0, 3) as $index => $result) {
            if (is_array($result)) {
                $results[] = $this->normalizeResult($result, (int) $index, $normalizedLocation);
            }
        }

        if ($results === []) {
            throw new RuntimeException('OpenAI web search did not return any job matches.');
        }

        $cvSummary = is_array($modelJson['cv_summary'] ?? null) ? $modelJson['cv_summary'] : [];

        return [
            'cv' => [
                'filename' => $filename,
                'word_count' => str_word_count($cvText),
                'detected_skills' => $this->stringList($cvSummary['detected_skills'] ?? []),
                'target_role' => (string) ($cvSummary['detected_role'] ?? ($targetRole ?: 'Auto-detect')),
                'location' => $normalizedLocation,
                'match_mode' => 'Live OpenAI web search',
            ],
            'results' => $results,
            'source_links' => $this->sourceLinks($responsePayload, $results),
        ];
    }

    public function isConfigured(): bool
    {
        return $this->apiKey() !== null;
    }

    /**
     * @param  array<string, mixed>  $job
     * @return array{
     *     title: string,
     *     summary: string,
     *     steps: array<int, array{
     *         skill: string,
     *         target_outcome: string,
     *         learning_actions: array<int, string>,
     *         learning_action_sources: array<int, array{title: string, url: string}>,
     *         portfolio_task: string,
     *         cv_proof: string,
     *         estimated_time: string,
     *         sources: array<int, array{title: string, url: string}>
     *     }>,
     *     timeline: array<int, string>,
     *     cv_updates: array<int, string>
     * }
     */
    public function generateRoadmap(array $job): array
    {
        $apiKey = $this->apiKey();

        if ($apiKey === null) {
            throw new RuntimeException('OpenAI API key is missing. Add OPENAI_API_KEY to generate a roadmap.');
        }

        $response = Http::withToken($apiKey)
            ->acceptJson()
            ->asJson()
            ->timeout((int) config('services.openai.timeout', 90))
            ->post('https://api.openai.com/v1/responses', [
                'model' => $this->model(),
                'input' => $this->roadmapPrompt($job),
                'text' => [
                    'format' => [
                        'type' => 'json_schema',
                        'name' => 'career_roadmap',
                        'strict' => true,
                        'schema' => $this->roadmapSchema(),
                    ],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('OpenAI roadmap generation failed: '.$response->body());
        }

        $roadmap = $this->parseModelJson($this->outputText($response->json() ?? []));

        if (! is_array($roadmap)) {
            throw new RuntimeException('OpenAI returned a roadmap that could not be parsed as JSON.');
        }

        return $this->normalizeRoadmap($roadmap, $job);
    }

    private function apiKey(): ?string
    {
        $apiKey = config('services.openai.api_key');

        if (is_string($apiKey) && trim($apiKey) !== '') {
            return trim($apiKey);
        }

        $localEnvPath = base_path('tools/openai_web_match/.env');

        if (! is_file($localEnvPath)) {
            return null;
        }

        foreach (file($localEnvPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            if (! str_starts_with(trim($line), 'OPENAI_API_KEY=')) {
                continue;
            }

            $value = trim(Str::after($line, '='));

            return $value !== '' ? trim($value, "\"'") : null;
        }

        return null;
    }

    private function model(): string
    {
        $model = config('services.openai.web_search_model');

        return is_string($model) && trim($model) !== '' ? trim($model) : 'gpt-5.5';
    }

    /**
     * @return array<int, string>
     */
    private function allowedDomains(): array
    {
        $domains = config('services.openai.web_search_domains', []);

        if (! is_array($domains) || $domains === []) {
            return ['itviec.com', 'vietnamworks.com', 'linkedin.com'];
        }

        return collect($domains)
            ->filter(fn (mixed $domain): bool => is_string($domain) && trim($domain) !== '')
            ->map(fn (string $domain): string => trim(preg_replace('/^https?:\/\//', '', $domain) ?? $domain, '/'))
            ->values()
            ->all();
    }

    private function compactText(string $cvText): string
    {
        $cvText = preg_replace('/[ \t]+/', ' ', $cvText) ?? $cvText;
        $cvText = preg_replace("/\n{3,}/", "\n\n", trim($cvText)) ?? $cvText;

        if (strlen($cvText) <= 12000) {
            return $cvText;
        }

        return rtrim(substr($cvText, 0, 12000))."\n\n[CV truncated for API request]";
    }

    private function prompt(string $cvText, string $role, string $location): string
    {
        return <<<PROMPT
You are helping build AI Career Pilot for the Vietnam IT market.

Task:
1. Search the live web for current Vietnam IT job postings or job search result pages.
2. Prefer ITviec, VietnamWorks, and LinkedIn Jobs.
3. Match the CV against the jobs you find.
4. Return exactly 3 ranked job matches.

Target role: {$role}
Target location: {$location}

Scoring rules:
- suitable_rate must be an integer from 0 to 100.
- Score based on skills, projects, experience level, education, and Vietnam job-market fit.
- Do not invent job URLs. Use URLs found by web search.
- If an exact job posting is not accessible, use the most relevant search/result URL and say so in source_note.
- Keep advice practical for a hackathon demo.

Return ONLY valid JSON with this shape:
{
  "cv_summary": {
    "detected_role": "string",
    "detected_skills": ["string"],
    "experience_level": "string"
  },
  "results": [
    {
      "rank": 1,
      "title": "string",
      "company": "string",
      "source": "ITviec | VietnamWorks | LinkedIn | other",
      "url": "string",
      "location": "string",
      "suitable_rate": 85,
      "job_description_summary": "string",
      "matched_skills": ["string"],
      "missing_skills": ["string"],
      "over_points": ["string"],
      "under_points": ["string"],
      "roadmap": ["string"],
      "source_note": "string"
    }
  ]
}

CV text:
"""
{$cvText}
"""
PROMPT;
    }

    /**
     * @param  array<string, mixed>  $job
     */
    private function roadmapPrompt(array $job): string
    {
        $missingSkills = implode(', ', $this->stringList($job['missing_skills'] ?? []));
        $matchedSkills = implode(', ', $this->stringList($job['matched_skills'] ?? []));
        $title = (string) ($job['title'] ?? 'Selected job');
        $company = (string) ($job['company'] ?? 'Selected company');
        $location = (string) ($job['location'] ?? 'Vietnam');
        $summary = (string) ($job['summary'] ?? $job['job_description'] ?? 'No summary provided.');

        return <<<PROMPT
You are AI Career Pilot. Generate a practical learning roadmap for a candidate after they click a matched job row.

Use exactly the requested JSON structure. Keep the roadmap specific to the missing skills and the selected job.

Selected job:
- Title: {$title}
- Company: {$company}
- Location: {$location}
- Job summary: {$summary}
- Matched skills: {$matchedSkills}
- Missing skills: {$missingSkills}

Rules:
- Create one step for each missing skill when missing skills exist.
- If there are no missing skills, create one step for interview readiness and CV tailoring.
- Each learning_actions list must contain exactly 3 short actions.
- Add exactly one learning_action_sources item for each learning_actions item, in the same order.
- Each learning_action_sources item must include a concise title and a real HTTPS URL that helps the candidate complete that exact action.
- Add 1 to 3 practical learning sources to each step. Prefer official documentation, platform guides, trusted university resources, or high-signal tutorials that directly help with that step.
- Each source must include a concise title and a real HTTPS URL.
- Keep estimated_time practical for an early-career candidate.
- Do not include markdown fences.
PROMPT;
    }

    /**
     * @return array<string, mixed>
     */
    private function roadmapSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'title' => ['type' => 'string'],
                'summary' => ['type' => 'string'],
                'steps' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'skill' => ['type' => 'string'],
                            'target_outcome' => ['type' => 'string'],
                            'learning_actions' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                            ],
                            'learning_action_sources' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'title' => ['type' => 'string'],
                                        'url' => ['type' => 'string'],
                                    ],
                                    'required' => ['title', 'url'],
                                    'additionalProperties' => false,
                                ],
                            ],
                            'portfolio_task' => ['type' => 'string'],
                            'cv_proof' => ['type' => 'string'],
                            'estimated_time' => ['type' => 'string'],
                            'sources' => [
                                'type' => 'array',
                                'items' => [
                                    'type' => 'object',
                                    'properties' => [
                                        'title' => ['type' => 'string'],
                                        'url' => ['type' => 'string'],
                                    ],
                                    'required' => ['title', 'url'],
                                    'additionalProperties' => false,
                                ],
                            ],
                        ],
                        'required' => ['skill', 'target_outcome', 'learning_actions', 'learning_action_sources', 'portfolio_task', 'cv_proof', 'estimated_time', 'sources'],
                        'additionalProperties' => false,
                    ],
                ],
                'timeline' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
                'cv_updates' => [
                    'type' => 'array',
                    'items' => ['type' => 'string'],
                ],
            ],
            'required' => ['title', 'summary', 'steps', 'timeline', 'cv_updates'],
            'additionalProperties' => false,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function outputText(array $payload): string
    {
        if (is_string($payload['output_text'] ?? null)) {
            return $payload['output_text'];
        }

        $parts = [];

        foreach ($payload['output'] ?? [] as $item) {
            if (! is_array($item)) {
                continue;
            }

            foreach ($item['content'] ?? [] as $content) {
                if (is_array($content) && is_string($content['text'] ?? null)) {
                    $parts[] = $content['text'];
                }
            }
        }

        return trim(implode("\n", $parts));
    }

    /**
     * @return array<string, mixed>|null
     */
    private function parseModelJson(string $text): ?array
    {
        $decoded = json_decode(trim($text), true);

        if (is_array($decoded)) {
            return $decoded;
        }

        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $text, $matches) === 1) {
            $decoded = json_decode($matches[1], true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        $start = strpos($text, '{');
        $end = strrpos($text, '}');

        if ($start === false || $end === false || $end <= $start) {
            return null;
        }

        $decoded = json_decode(substr($text, $start, $end - $start + 1), true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * @param  array<string, mixed>  $result
     * @return array<string, mixed>
     */
    private function normalizeResult(array $result, int $index, string $fallbackLocation): array
    {
        $title = (string) ($result['title'] ?? 'Vietnam IT role');
        $url = (string) ($result['url'] ?? 'https://itviec.com/it-jobs');
        $roadmap = $this->stringList($result['roadmap'] ?? []);
        $underPoints = $this->stringList($result['under_points'] ?? []);

        return [
            'id' => Str::slug($title).'-'.($index + 1),
            'title' => $title,
            'company' => (string) ($result['company'] ?? 'Company from live search'),
            'source' => (string) ($result['source'] ?? parse_url($url, PHP_URL_HOST) ?: 'Live web'),
            'url' => $url,
            'location' => (string) ($result['location'] ?? $fallbackLocation),
            'suitable_rate' => max(0, min(100, (int) ($result['suitable_rate'] ?? 0))),
            'summary' => (string) ($result['job_description_summary'] ?? $result['summary'] ?? 'Live job match from OpenAI web search.'),
            'job_description' => (string) ($result['job_description_summary'] ?? $result['job_description'] ?? 'Review the linked posting for the full job description.'),
            'matched_skills' => $this->stringList($result['matched_skills'] ?? []),
            'missing_skills' => $this->stringList($result['missing_skills'] ?? []),
            'over_points' => $this->stringList($result['over_points'] ?? []),
            'under_points' => array_values(array_unique([...$underPoints, ...$roadmap])),
            'source_note' => (string) ($result['source_note'] ?? 'Live OpenAI web search result.'),
        ];
    }

    /**
     * @param  array<string, mixed>  $roadmap
     * @param  array<string, mixed>  $job
     * @return array{
     *     title: string,
     *     summary: string,
     *     steps: array<int, array{
     *         skill: string,
     *         target_outcome: string,
     *         learning_actions: array<int, string>,
     *         learning_action_sources: array<int, array{title: string, url: string}>,
     *         portfolio_task: string,
     *         cv_proof: string,
     *         estimated_time: string,
     *         sources: array<int, array{title: string, url: string}>
     *     }>,
     *     timeline: array<int, string>,
     *     cv_updates: array<int, string>
     * }
     */
    private function normalizeRoadmap(array $roadmap, array $job): array
    {
        $missingSkills = $this->stringList($job['missing_skills'] ?? []);
        $fallbackSkill = $missingSkills[0] ?? 'CV tailoring';
        $steps = [];
        $rawSteps = is_array($roadmap['steps'] ?? null) ? $roadmap['steps'] : [];

        foreach ($rawSteps as $step) {
            if (! is_array($step)) {
                continue;
            }

            $skill = (string) ($step['skill'] ?? $fallbackSkill);
            $sources = $this->sourceList($step['sources'] ?? []);
            $learningActions = array_slice($this->stringList($step['learning_actions'] ?? []), 0, 3);

            $steps[] = [
                'skill' => $skill,
                'target_outcome' => (string) ($step['target_outcome'] ?? 'Show job-ready evidence for this skill.'),
                'learning_actions' => $learningActions,
                'learning_action_sources' => $this->learningActionSources($learningActions, $step['learning_action_sources'] ?? []),
                'portfolio_task' => (string) ($step['portfolio_task'] ?? 'Add a focused project task that demonstrates the skill.'),
                'cv_proof' => (string) ($step['cv_proof'] ?? 'Add one measurable CV bullet with the outcome.'),
                'estimated_time' => (string) ($step['estimated_time'] ?? '1 week'),
                'sources' => $sources !== [] ? $sources : $this->fallbackRoadmapSources($skill),
            ];
        }

        if ($steps === []) {
            $steps[] = [
                'skill' => $fallbackSkill,
                'target_outcome' => 'Create visible evidence that fits the selected job.',
                'learning_actions' => ['Study the JD keywords.', 'Build one small proof task.', 'Rewrite one CV bullet with measurable impact.'],
                'learning_action_sources' => $this->learningActionSources([
                    'Study the JD keywords.',
                    'Build one small proof task.',
                    'Rewrite one CV bullet with measurable impact.',
                ], []),
                'portfolio_task' => 'Publish a small project or case note tied to the selected role.',
                'cv_proof' => 'Add a bullet that names the skill, action, and result.',
                'estimated_time' => '1 week',
                'sources' => $this->fallbackRoadmapSources($fallbackSkill),
            ];
        }

        return [
            'title' => (string) ($roadmap['title'] ?? 'Roadmap for '.($job['title'] ?? 'selected job')),
            'summary' => (string) ($roadmap['summary'] ?? 'Focus on the missing skills that most affect this job match.'),
            'steps' => $steps,
            'timeline' => $this->stringList($roadmap['timeline'] ?? []),
            'cv_updates' => $this->stringList($roadmap['cv_updates'] ?? []),
        ];
    }

    /**
     * @param  array<int, string>  $learningActions
     * @return array<int, array{title: string, url: string}>
     */
    private function learningActionSources(array $learningActions, mixed $values): array
    {
        $sources = $this->sourceList($values);

        foreach ($learningActions as $index => $action) {
            if (isset($sources[$index])) {
                continue;
            }

            $sources[$index] = $this->fallbackRoadmapSources($action)[0];
        }

        return array_slice(array_values($sources), 0, count($learningActions));
    }

    /**
     * @return array<int, array{title: string, url: string}>
     */
    private function sourceList(mixed $values): array
    {
        if (! is_array($values)) {
            return [];
        }

        $sources = [];

        foreach ($values as $value) {
            if (! is_array($value)) {
                continue;
            }

            $url = trim((string) ($value['url'] ?? ''));
            $title = trim((string) ($value['title'] ?? ''));

            if ($title === '' || ! Str::startsWith($url, 'https://')) {
                continue;
            }

            $sources[] = [
                'title' => $title,
                'url' => $url,
            ];

            if (count($sources) === 3) {
                break;
            }
        }

        return $sources;
    }

    /**
     * @return array<int, array{title: string, url: string}>
     */
    private function fallbackRoadmapSources(string $skill): array
    {
        $query = rawurlencode($skill);

        return [
            [
                'title' => 'freeCodeCamp',
                'url' => "https://www.freecodecamp.org/news/search/?query={$query}",
            ],
            [
                'title' => 'MDN Web Docs',
                'url' => 'https://developer.mozilla.org/en-US/docs/Learn',
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function stringList(mixed $values): array
    {
        if (! is_array($values)) {
            return [];
        }

        return collect($values)
            ->filter(fn (mixed $value): bool => is_string($value) || is_numeric($value))
            ->map(fn (mixed $value): string => trim((string) $value))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, array<string, mixed>>  $results
     * @return array<int, array{source: string, url: string, note: string}>
     */
    private function sourceLinks(array $payload, array $results): array
    {
        $sources = [];

        $this->walk($payload, function (array $node) use (&$sources): void {
            if (($node['type'] ?? null) === 'url_citation' && is_string($node['url'] ?? null)) {
                $sources[$node['url']] = [
                    'source' => (string) ($node['title'] ?? parse_url($node['url'], PHP_URL_HOST) ?: 'Source'),
                    'url' => $node['url'],
                    'note' => 'Cited by OpenAI web search.',
                ];
            }
        });

        foreach ($results as $result) {
            if (is_string($result['url'] ?? null) && $result['url'] !== '') {
                $sources[$result['url']] ??= [
                    'source' => (string) ($result['source'] ?? parse_url($result['url'], PHP_URL_HOST) ?: 'Source'),
                    'url' => $result['url'],
                    'note' => 'Job match link.',
                ];
            }
        }

        return array_slice(array_values($sources), 0, 6);
    }

    private function walk(mixed $value, callable $visitor): void
    {
        if (is_array($value)) {
            if (Arr::isAssoc($value)) {
                $visitor($value);
            }

            foreach ($value as $child) {
                $this->walk($child, $visitor);
            }
        }
    }
}
