<?php

namespace App\Services;

use Illuminate\Support\Str;

class VietnamJobMatchService
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
        $normalizedLocation = trim((string) $location) !== '' ? trim((string) $location) : 'Vietnam';
        $detectedSkills = $this->detectSkills($cvText);
        $selectedRole = $this->resolveTargetRole($cvText, $targetRole);

        $results = collect($this->jobProfiles())
            ->map(fn (array $profile): array => $this->scoreProfile($profile, $cvText, $detectedSkills, $selectedRole, $normalizedLocation))
            ->sortByDesc('suitable_rate')
            ->take(3)
            ->values()
            ->all();

        return [
            'cv' => [
                'filename' => $filename,
                'word_count' => str_word_count($cvText),
                'detected_skills' => array_values($detectedSkills),
                'target_role' => $selectedRole,
                'location' => $normalizedLocation,
                'match_mode' => 'Fast demo matcher',
            ],
            'results' => $results,
            'source_links' => $this->sourceLinks($selectedRole, $normalizedLocation),
        ];
    }

    /**
     * @return array<int, string>
     */
    public function targetRoles(): array
    {
        return array_map(
            fn (array $profile): string => $profile['title'],
            $this->jobProfiles(),
        );
    }

    /**
     * @return array<int, string>
     */
    private function detectSkills(string $cvText): array
    {
        $text = Str::of($cvText)->lower()->toString();
        $skillKeywords = collect($this->jobProfiles())
            ->flatMap(fn (array $profile): array => $profile['keywords'])
            ->unique()
            ->values()
            ->all();

        return collect($skillKeywords)
            ->filter(fn (string $skill): bool => str_contains($text, Str::of($skill)->lower()->toString()))
            ->values()
            ->all();
    }

    private function resolveTargetRole(string $cvText, ?string $targetRole): string
    {
        if ($targetRole !== null && trim($targetRole) !== '' && trim($targetRole) !== 'Auto-detect') {
            return trim($targetRole);
        }

        $detectedSkills = $this->detectSkills($cvText);

        return collect($this->jobProfiles())
            ->mapWithKeys(fn (array $profile): array => [
                $profile['title'] => count(array_intersect($profile['keywords'], $detectedSkills)),
            ])
            ->sortDesc()
            ->keys()
            ->first() ?? 'Frontend Developer Fresher';
    }

    /**
     * @param  array<string, mixed>  $profile
     * @param  array<int, string>  $detectedSkills
     * @return array<string, mixed>
     */
    private function scoreProfile(array $profile, string $cvText, array $detectedSkills, string $selectedRole, string $location): array
    {
        $matchedSkills = array_values(array_intersect($profile['keywords'], $detectedSkills));
        $missingSkills = array_values(array_diff($profile['keywords'], $matchedSkills));
        $skillRatio = count($matchedSkills) / max(count($profile['keywords']), 1);
        $text = Str::of($cvText)->lower()->toString();

        $score = 42 + (int) round($skillRatio * 43);

        if ($profile['title'] === $selectedRole) {
            $score += 7;
        }

        if (str_contains($text, 'project') || str_contains($text, 'github')) {
            $score += 4;
        }

        if (str_contains($text, 'intern') || str_contains($text, 'fresher') || str_contains($text, 'junior')) {
            $score += 4;
        }

        $score = max(45, min(95, $score));

        return [
            'id' => Str::slug($profile['title']),
            'title' => $profile['title'],
            'company' => $profile['company'],
            'source' => $profile['source'],
            'url' => $this->portalUrl($profile['source'], $profile['query'], $location),
            'location' => $location,
            'suitable_rate' => $score,
            'summary' => $profile['summary'],
            'job_description' => $profile['description'],
            'matched_skills' => $matchedSkills,
            'missing_skills' => array_slice($missingSkills, 0, 6),
            'over_points' => $this->overPoints($matchedSkills),
            'under_points' => $this->underPoints($missingSkills, $profile['title']),
            'source_note' => 'Hackathon mode: opens a live Vietnam job portal search while scoring against a realistic role profile.',
        ];
    }

    /**
     * @param  array<int, string>  $matchedSkills
     * @return array<int, string>
     */
    private function overPoints(array $matchedSkills): array
    {
        if ($matchedSkills === []) {
            return ['CV has readable structure, but needs clearer role-specific skills.'];
        }

        return [
            'Strong evidence for '.implode(', ', array_slice($matchedSkills, 0, 4)).'.',
            'CV includes practical project or internship signals that fit early-career Vietnam IT roles.',
        ];
    }

    /**
     * @param  array<int, string>  $missingSkills
     * @return array<int, string>
     */
    private function underPoints(array $missingSkills, string $role): array
    {
        if ($missingSkills === []) {
            return ['Few obvious gaps. Tailor CV bullets to the exact job description before applying.'];
        }

        return [
            'Add proof for '.implode(', ', array_slice($missingSkills, 0, 3)).' before applying to stronger '.$role.' roles.',
            'Build one portfolio project that visibly uses the missing skills and link it in the CV.',
            'Rewrite 2-3 CV bullets using the job title language from the linked posting.',
        ];
    }

    /**
     * @return array<int, array{source: string, url: string, note: string}>
     */
    private function sourceLinks(string $role, string $location): array
    {
        $query = Str::of($role)->replace('Fresher', '')->replace('Intern', '')->trim()->toString();

        return [
            [
                'source' => 'ITviec',
                'url' => $this->portalUrl('ITviec', $query, $location),
                'note' => 'Best for Vietnam tech-specific job listings.',
            ],
            [
                'source' => 'VietnamWorks',
                'url' => $this->portalUrl('VietnamWorks', $query, $location),
                'note' => 'Broad Vietnam job portal with many fresher and junior roles.',
            ],
            [
                'source' => 'LinkedIn',
                'url' => $this->portalUrl('LinkedIn', $query, $location),
                'note' => 'Useful for international companies and recruiter-visible roles.',
            ],
        ];
    }

    private function portalUrl(string $source, string $query, string $location): string
    {
        $query = trim($query);
        $location = trim($location);

        return match ($source) {
            'ITviec' => 'https://itviec.com/it-jobs/'.Str::slug($query),
            'VietnamWorks' => 'https://www.vietnamworks.com/jobs?q='.rawurlencode($query.' '.$location),
            'LinkedIn' => 'https://www.linkedin.com/jobs/search/?keywords='.rawurlencode($query).'&location='.rawurlencode($location),
            default => 'https://www.google.com/search?q='.rawurlencode($query.' '.$location.' IT jobs'),
        };
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function jobProfiles(): array
    {
        return [
            [
                'title' => 'Frontend Developer Fresher',
                'company' => 'Vietnam tech startup / product team',
                'source' => 'ITviec',
                'query' => 'reactjs',
                'keywords' => ['html', 'css', 'javascript', 'typescript', 'react', 'next.js', 'tailwind', 'rest api', 'git'],
                'summary' => 'Build responsive web interfaces, connect APIs, and ship reusable components.',
                'description' => 'Typical JD asks for React or Next.js, TypeScript or JavaScript, responsive UI, REST API integration, Git workflow, and a portfolio showing real user-facing screens.',
            ],
            [
                'title' => 'Backend Developer Fresher',
                'company' => 'Vietnam software outsourcing / SaaS team',
                'source' => 'VietnamWorks',
                'query' => 'backend developer fresher',
                'keywords' => ['node.js', 'express', 'laravel', 'php', 'postgresql', 'mysql', 'mongodb', 'rest api', 'docker', 'jwt', 'linux'],
                'summary' => 'Design APIs, handle databases, authentication, validation, and deployment basics.',
                'description' => 'Typical JD asks for REST APIs, relational database knowledge, authentication, clean request validation, Git, basic Docker/Linux, and readable API documentation.',
            ],
            [
                'title' => 'Data Analyst Intern',
                'company' => 'Vietnam e-commerce / finance analytics team',
                'source' => 'LinkedIn',
                'query' => 'data analyst intern',
                'keywords' => ['sql', 'python', 'pandas', 'excel', 'power bi', 'tableau', 'data cleaning', 'dashboard', 'a/b testing'],
                'summary' => 'Clean data, build dashboards, and explain business insights from product or sales data.',
                'description' => 'Typical JD asks for SQL, Excel, dashboarding with Power BI or Tableau, basic Python/Pandas, data cleaning, KPI thinking, and clear insight presentation.',
            ],
            [
                'title' => 'QA Engineer Intern',
                'company' => 'Vietnam product QA / mobile app team',
                'source' => 'ITviec',
                'query' => 'qa engineer intern',
                'keywords' => ['manual testing', 'test case', 'bug report', 'postman', 'selenium', 'jira', 'regression testing', 'sql', 'agile'],
                'summary' => 'Verify product quality through test cases, API checks, bug reports, and regression cycles.',
                'description' => 'Typical JD asks for test case design, clear bug reports, API testing with Postman, regression testing, Agile collaboration, and basic automation awareness.',
            ],
            [
                'title' => 'AI/ML Engineer Fresher',
                'company' => 'Vietnam AI lab / applied ML product team',
                'source' => 'LinkedIn',
                'query' => 'machine learning fresher',
                'keywords' => ['python', 'numpy', 'pandas', 'scikit-learn', 'pytorch', 'nlp', 'computer vision', 'model evaluation', 'jupyter'],
                'summary' => 'Prepare datasets, train baseline models, evaluate results, and document experiments.',
                'description' => 'Typical JD asks for Python, ML fundamentals, data preprocessing, model evaluation metrics, basic PyTorch or Scikit-learn, and at least one reproducible ML project.',
            ],
        ];
    }
}
