<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected from the career match page', function () {
    $response = $this->get(route('career-match.index'));

    $response->assertRedirect(route('login'));
});

test('authenticated users can analyze a cv with live openai web search', function () {
    $this->withoutVite();

    config(['services.openai.api_key' => 'test-openai-key']);

    Http::fake([
        'api.openai.com/*' => Http::response([
            'output' => [
                [
                    'type' => 'web_search_call',
                    'status' => 'completed',
                    'action' => [
                        'type' => 'search',
                        'query' => 'frontend developer fresher Vietnam ITviec',
                    ],
                ],
                [
                    'type' => 'message',
                    'content' => [
                        [
                            'type' => 'output_text',
                            'text' => json_encode([
                                'cv_summary' => [
                                    'detected_role' => 'Frontend Developer Fresher',
                                    'detected_skills' => ['react', 'typescript', 'rest api'],
                                    'experience_level' => 'fresher',
                                ],
                                'results' => [
                                    [
                                        'rank' => 1,
                                        'title' => 'Frontend Developer Fresher',
                                        'company' => 'Vietnam Product Team',
                                        'source' => 'ITviec',
                                        'url' => 'https://itviec.com/it-jobs/frontend-developer-fresher',
                                        'location' => 'Vietnam',
                                        'suitable_rate' => 88,
                                        'job_description_summary' => 'Build React interfaces and connect REST APIs.',
                                        'matched_skills' => ['react', 'typescript', 'rest api'],
                                        'missing_skills' => ['testing'],
                                        'over_points' => ['Good frontend project evidence.'],
                                        'under_points' => ['Add testing examples.'],
                                        'roadmap' => ['Build one tested React project.'],
                                        'source_note' => 'Mocked live search result.',
                                    ],
                                    [
                                        'rank' => 2,
                                        'title' => 'React Intern',
                                        'company' => 'Startup',
                                        'source' => 'VietnamWorks',
                                        'url' => 'https://www.vietnamworks.com/jobs?q=react+intern',
                                        'location' => 'Vietnam',
                                        'suitable_rate' => 82,
                                        'job_description_summary' => 'Support React UI work.',
                                        'matched_skills' => ['react'],
                                        'missing_skills' => ['next.js'],
                                        'over_points' => ['React basics fit.'],
                                        'under_points' => ['Add Next.js proof.'],
                                        'roadmap' => ['Ship a Next.js page.'],
                                        'source_note' => 'Mocked live search result.',
                                    ],
                                    [
                                        'rank' => 3,
                                        'title' => 'Junior Web Developer',
                                        'company' => 'Agency',
                                        'source' => 'LinkedIn',
                                        'url' => 'https://www.linkedin.com/jobs/search/?keywords=junior%20web%20developer',
                                        'location' => 'Vietnam',
                                        'suitable_rate' => 77,
                                        'job_description_summary' => 'Build web pages and integrate APIs.',
                                        'matched_skills' => ['javascript', 'rest api'],
                                        'missing_skills' => ['css architecture'],
                                        'over_points' => ['API integration fits.'],
                                        'under_points' => ['Add CSS architecture examples.'],
                                        'roadmap' => ['Refactor portfolio CSS.'],
                                        'source_note' => 'Mocked live search result.',
                                    ],
                                ],
                            ]),
                            'annotations' => [
                                [
                                    'type' => 'url_citation',
                                    'url' => 'https://itviec.com/it-jobs/frontend-developer-fresher',
                                    'title' => 'Frontend Developer Fresher',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $user = User::factory()->create();

    $cv = UploadedFile::fake()->createWithContent(
        'frontend-fresher.txt',
        implode("\n", [
            'Nguyen Minh Anh',
            'Frontend Developer Fresher',
            'Skills: HTML, CSS, JavaScript, TypeScript, React, REST API, Git',
            'Experience: Frontend Intern at GreenEdu Startup.',
            'Projects: Portfolio website and task tracker app on GitHub.',
            'Education: B.Eng. Software Engineering.',
            'Built reusable components, connected API data, improved accessibility, and documented setup steps for recruiters.',
            'Looking for a fresher frontend role in Vietnam with practical product work and clear portfolio evidence.',
        ]),
    );

    $response = $this
        ->actingAs($user)
        ->post(route('career-match.analyze'), [
            'cv' => $cv,
            'target_role' => 'Frontend Developer Fresher',
            'location' => 'Vietnam',
            'match_mode' => 'live_openai',
        ]);

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('career-match')
            ->has('analysis.results', 3)
            ->where('analysis.cv.match_mode', 'Live OpenAI web search')
            ->where('analysis.results.0.suitable_rate', 88)
        );

    Http::assertSent(fn ($request): bool => $request->hasHeader('Authorization', 'Bearer test-openai-key')
        && $request['tools'][0]['type'] === 'web_search'
        && $request['tool_choice'] === 'required');
});

test('authenticated users can analyze a cv against vietnam it roles', function () {
    $this->withoutVite();

    $user = User::factory()->create();

    $cv = UploadedFile::fake()->createWithContent(
        'frontend-fresher.txt',
        implode("\n", [
            'Nguyen Minh Anh',
            'Frontend Developer Fresher',
            'Skills: HTML, CSS, JavaScript, TypeScript, React, Next.js, Tailwind CSS, REST API, Git',
            'Experience: Frontend Intern at GreenEdu Startup.',
            'Projects: Portfolio website and task tracker app on GitHub.',
            'Education: B.Eng. Software Engineering.',
            'Built reusable components, connected API data, improved accessibility, and documented setup steps for recruiters.',
            'Looking for a fresher frontend role in Vietnam with practical product work and clear portfolio evidence.',
        ]),
    );

    $response = $this
        ->actingAs($user)
        ->post(route('career-match.analyze'), [
            'cv' => $cv,
            'target_role' => 'Auto-detect',
            'location' => 'Vietnam',
        ]);

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('career-match')
            ->has('analysis.results', 3)
            ->where('analysis.cv.filename', 'frontend-fresher.txt')
        );
});
