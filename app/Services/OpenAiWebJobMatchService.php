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

        $results = collect($modelJson['results'] ?? [])
            ->take(3)
            ->values()
            ->map(fn (array $result, int $index): array => $this->normalizeResult($result, $index, $normalizedLocation))
            ->all();

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

    private function apiKey(): ?string
    {
        $apiKey = config('services.openai.api_key') ?: env('OPENAI_API_KEY');

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
        $model = config('services.openai.web_search_model') ?: env('OPENAI_WEB_SEARCH_MODEL');

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
