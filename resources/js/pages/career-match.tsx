import { Head, router, useForm } from '@inertiajs/react';
import {
    ExternalLink,
    FileSearch,
    LoaderCircle,
    Map,
    SearchCheck,
    Send,
    Upload,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
    analyze,
    roadmap,
    roadmapProgress,
} from '@/actions/App/Http/Controllers/CareerMatchController';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type JobResult = {
    id: string;
    title: string;
    company: string;
    source: string;
    url: string;
    location: string;
    suitable_rate: number;
    summary: string;
    job_description: string;
    matched_skills: string[];
    missing_skills: string[];
    over_points: string[];
    under_points: string[];
    source_note: string;
};

type Analysis = {
    results: JobResult[];
};

type RoadmapSource = {
    title: string;
    url: string;
};

type RoadmapStep = {
    skill: string;
    target_outcome: string;
    learning_actions: string[];
    learning_action_sources?: RoadmapSource[];
    portfolio_task: string;
    cv_proof: string;
    estimated_time: string;
    sources?: RoadmapSource[];
};

type Roadmap = {
    title: string;
    summary: string;
    steps: RoadmapStep[];
    timeline: string[];
    cv_updates: string[];
};

type CareerMatchRoadmap = {
    job_id: string;
    roadmap: Roadmap;
    completed_steps?: number[];
    progress_action?: RoadmapProgressAction;
};

type RoadmapProgressAction = 'update_cv' | 'submit';

type Props = {
    analysis: Analysis | null;
    careerMatchRoadmap: CareerMatchRoadmap | null;
    openAiConfigured: boolean;
    targetRoles: string[];
};

export default function CareerMatch({
    analysis,
    careerMatchRoadmap,
    openAiConfigured,
    targetRoles,
}: Props) {
    const [activeRoadmapJobId, setActiveRoadmapJobId] = useState<string | null>(
        null,
    );
    const [roadmapError, setRoadmapError] = useState<string | null>(null);
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
    const { data, setData, post, processing, errors } = useForm({
        cv: null as File | null,
        target_role: 'Auto-detect',
        location: 'Vietnam',
        match_mode: 'live_openai',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setRoadmapError(null);
        post(analyze.url(), {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function generateRoadmap(job: JobResult) {
        setActiveRoadmapJobId(job.id);
        setRoadmapError(null);

        router.post(
            roadmap.url(),
            { job_id: job.id },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setRoadmapError(
                        String(
                            errors.job_id ??
                                'Unable to generate the roadmap for this job.',
                        ),
                    );
                },
                onFinish: () => setActiveRoadmapJobId(null),
            },
        );
    }

    function toggleSelectedJob(jobId: string, checked: boolean) {
        setSelectedJobIds((current) => {
            if (checked) {
                return Array.from(new Set([...current, jobId]));
            }

            return current.filter((selectedJobId) => selectedJobId !== jobId);
        });
    }

    return (
        <>
            <Head title="Vietnam Job Match" />

            <div className="min-h-screen bg-[#EDEADF] p-4 text-black md:p-6">
                <div className="mx-auto flex max-w-7xl flex-col gap-6">
                    <section className="border-2 border-black bg-[#EDEADF] p-6 shadow-[8px_8px_0_#000] md:p-8">
                        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                            <div className="max-w-3xl">
                                <div className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-[#F97316] px-3 py-2 text-xs font-bold tracking-wide uppercase shadow-[3px_3px_0_#000]">
                                    <SearchCheck className="size-4" />
                                    Vietnam IT Career Match
                                </div>
                                <h1 className="text-4xl leading-none font-semibold tracking-tight md:text-6xl">
                                    Upload a CV. Best match job in Vietnam.
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-7 text-[#374151] md:text-lg">
                                    The matcher reads an ATS-friendly CV,
                                    detects skills, scores role fit, and opens
                                    live search links on Vietnam-focused job
                                    portals.
                                </p>
                            </div>

                            <form
                                onSubmit={submit}
                                className="border-2 border-black bg-[#D8D8D2] p-5 shadow-[6px_6px_0_#000]"
                            >
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Mode</Label>
                                        <div className="flex min-h-11 items-center border-2 border-black bg-[#1D4ED8] px-3 text-sm font-black text-white uppercase">
                                            Live Web
                                        </div>
                                        <InputError
                                            message={errors.match_mode}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="cv">CV file</Label>
                                        <Input
                                            id="cv"
                                            type="file"
                                            accept=".pdf,.docx,.txt"
                                            onChange={(event) =>
                                                setData(
                                                    'cv',
                                                    event.currentTarget
                                                        .files?.[0] ?? null,
                                                )
                                            }
                                            className="min-h-11 rounded-none border-black bg-white"
                                        />
                                        <InputError message={errors.cv} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="target_role">
                                            Target role
                                        </Label>
                                        <select
                                            id="target_role"
                                            value={data.target_role}
                                            onChange={(event) =>
                                                setData(
                                                    'target_role',
                                                    event.target.value,
                                                )
                                            }
                                            className="min-h-11 rounded-none border border-black bg-white px-3 text-sm shadow-xs outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/25"
                                        >
                                            {targetRoles.map((role) => (
                                                <option key={role} value={role}>
                                                    {role}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors.target_role}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="location">
                                            Location
                                        </Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={(event) =>
                                                setData(
                                                    'location',
                                                    event.target.value,
                                                )
                                            }
                                            className="min-h-11 rounded-none border-black bg-white"
                                            placeholder="Vietnam, Ho Chi Minh, Hanoi..."
                                        />
                                        <InputError message={errors.location} />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="min-h-11 rounded-none border-2 border-black bg-[#1D4ED8] font-bold tracking-wide text-white uppercase shadow-[5px_5px_0_#000] hover:bg-[#1E40AF]"
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <Upload className="size-4" />
                                        )}
                                        Match CV
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </section>

                    {analysis ? (
                        <section className="space-y-6">
                            {roadmapError && (
                                <Alert className="rounded-none border-2 border-black bg-[#FFEDD5] shadow-[5px_5px_0_#000]">
                                    <AlertTitle>Roadmap unavailable</AlertTitle>
                                    <AlertDescription>
                                        {roadmapError}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex flex-col gap-3 border-2 border-black bg-[#E5E5E0] p-4 shadow-[5px_5px_0_#000] sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-bold tracking-wide uppercase">
                                    {selectedJobIds.length} job
                                    {selectedJobIds.length === 1
                                        ? ''
                                        : 's'}{' '}
                                    selected
                                </p>
                                <Button
                                    type="button"
                                    disabled={selectedJobIds.length === 0}
                                    className="rounded-none border-2 border-black bg-[#1D4ED8] font-bold tracking-wide text-white uppercase shadow-[4px_4px_0_#000] hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:text-[#6B7280]"
                                >
                                    <Send className="size-4" />
                                    Send CV
                                </Button>
                            </div>

                            {analysis.results.map((job, index) => (
                                <JobMatchCard
                                    key={job.id}
                                    job={job}
                                    rank={index + 1}
                                    isSelected={selectedJobIds.includes(job.id)}
                                    activeRoadmapJobId={activeRoadmapJobId}
                                    canGenerateRoadmap={openAiConfigured}
                                    roadmap={
                                        careerMatchRoadmap?.job_id === job.id
                                            ? careerMatchRoadmap.roadmap
                                            : null
                                    }
                                    completedSteps={
                                        careerMatchRoadmap?.job_id === job.id
                                            ? (careerMatchRoadmap.completed_steps ??
                                              [])
                                            : []
                                    }
                                    onToggleSelected={toggleSelectedJob}
                                    onGenerateRoadmap={generateRoadmap}
                                />
                            ))}
                        </section>
                    ) : (
                        <Alert className="rounded-none border-2 border-black bg-[#E5E5E0] shadow-[5px_5px_0_#000]">
                            <FileSearch className="size-4" />
                            <AlertTitle>No analysis yet</AlertTitle>
                            <AlertDescription>
                                Upload one of the sample CVs or your own
                                ATS-readable CV to generate the first match
                                result.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </>
    );
}

function SkillList({ skills }: { skills: string[] }) {
    if (skills.length === 0) {
        return (
            <p className="text-sm text-[#374151]">
                No obvious role keywords detected.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {skills.slice(0, 18).map((skill) => (
                <Badge
                    key={skill}
                    className="rounded-none border border-black bg-white text-black"
                    variant="outline"
                >
                    {skill}
                </Badge>
            ))}
        </div>
    );
}

function JobMatchCard({
    job,
    rank,
    isSelected,
    activeRoadmapJobId,
    canGenerateRoadmap,
    roadmap,
    completedSteps,
    onToggleSelected,
    onGenerateRoadmap,
}: {
    job: JobResult;
    rank: number;
    isSelected: boolean;
    activeRoadmapJobId: string | null;
    canGenerateRoadmap: boolean;
    roadmap: Roadmap | null;
    completedSteps: number[];
    onToggleSelected: (jobId: string, checked: boolean) => void;
    onGenerateRoadmap: (job: JobResult) => void;
}) {
    const isGeneratingRoadmap = activeRoadmapJobId === job.id;
    const roadmapFormId = `career-roadmap-progress-${job.id}`;
    const [processingProgressAction, setProcessingProgressAction] =
        useState<RoadmapProgressAction | null>(null);

    return (
        <article className="border-2 border-black bg-[#E5E5E0] p-5 shadow-[6px_6px_0_#000]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex size-12 items-center justify-center border-2 border-black bg-[#F97316] text-lg font-black shadow-[3px_3px_0_#000]">
                            {rank}
                        </div>
                        <label className="inline-flex min-h-11 items-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-bold tracking-wide uppercase shadow-[3px_3px_0_#000]">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(event) =>
                                    onToggleSelected(
                                        job.id,
                                        event.currentTarget.checked,
                                    )
                                }
                                className="size-4 rounded-none border-2 border-black accent-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]"
                            />
                            Select job
                        </label>
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {job.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#374151]">
                        {job.company} · {job.source} · {job.location}
                    </p>
                </div>

                <div className="border-2 border-black bg-white px-4 py-3 text-center shadow-[4px_4px_0_#000]">
                    <p className="text-xs font-bold tracking-wide text-[#374151] uppercase">
                        Suitable Rate
                    </p>
                    <p className="text-3xl font-black">{job.suitable_rate}%</p>
                </div>
            </div>

            <p className="mt-4 leading-7 text-[#111827]">{job.summary}</p>
            <p className="mt-3 border-l-4 border-black pl-3 text-sm leading-6 text-[#374151]">
                {job.job_description}
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <EvidenceBlock
                    title="Over points"
                    items={job.over_points}
                    tone="good"
                />
                <EvidenceBlock
                    title="Under points"
                    items={job.under_points}
                    tone="warn"
                />
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase">
                        Matched skills
                    </p>
                    <SkillList skills={job.matched_skills} />
                </div>
                <div>
                    <p className="mb-2 text-sm font-semibold tracking-wide uppercase">
                        Missing skills
                    </p>
                    <SkillList skills={job.missing_skills} />
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t-2 border-black pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[#374151]">{job.source_note}</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                        type="button"
                        onClick={() => onGenerateRoadmap(job)}
                        disabled={
                            activeRoadmapJobId !== null || !canGenerateRoadmap
                        }
                        className="rounded-none border-2 border-black bg-[#F97316] font-bold tracking-wide text-black uppercase shadow-[4px_4px_0_#000] hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:bg-[#D1D5DB] disabled:text-[#6B7280]"
                    >
                        {isGeneratingRoadmap ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <Map className="size-4" />
                        )}
                        {isGeneratingRoadmap
                            ? 'Generating roadmap'
                            : 'Generate roadmap'}
                    </Button>

                    <Button
                        asChild
                        className="rounded-none border-2 border-black bg-[#1D4ED8] font-bold tracking-wide text-white uppercase shadow-[4px_4px_0_#000] hover:bg-[#1E40AF]"
                    >
                        <a href={job.url} target="_blank" rel="noreferrer">
                            Open job search
                            <ExternalLink className="size-4" />
                        </a>
                    </Button>

                    {roadmap && (
                        <>
                            <Button
                                type="submit"
                                form={roadmapFormId}
                                name="action"
                                value="update_cv"
                                disabled={processingProgressAction !== null}
                                className="rounded-none border-2 border-black bg-[#F97316] font-bold tracking-wide text-black uppercase shadow-[4px_4px_0_#000] hover:bg-[#EA580C]"
                            >
                                {processingProgressAction === 'update_cv' && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                Update CV
                            </Button>
                            <Button
                                type="submit"
                                form={roadmapFormId}
                                name="action"
                                value="submit"
                                disabled={processingProgressAction !== null}
                                className="rounded-none border-2 border-black bg-[#1D4ED8] font-bold tracking-wide text-white uppercase shadow-[4px_4px_0_#000] hover:bg-[#1E40AF]"
                            >
                                {processingProgressAction === 'submit' && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                Submit
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {!canGenerateRoadmap && (
                <p className="mt-4 border-2 border-black bg-[#FFEDD5] p-3 text-sm font-semibold text-[#111827]">
                    Add OPENAI_API_KEY to generate roadmaps from missing skills.
                </p>
            )}

            {roadmap && (
                <RoadmapPanel
                    formId={roadmapFormId}
                    jobId={job.id}
                    roadmap={roadmap}
                    completedSteps={completedSteps}
                    setProcessingAction={setProcessingProgressAction}
                />
            )}
        </article>
    );
}

function RoadmapPanel({
    formId,
    jobId,
    roadmap,
    completedSteps: initialCompletedSteps,
    setProcessingAction,
}: {
    formId: string;
    jobId: string;
    roadmap: Roadmap;
    completedSteps: number[];
    setProcessingAction: (action: RoadmapProgressAction | null) => void;
}) {
    const [completedSteps, setCompletedSteps] = useState<number[]>(
        initialCompletedSteps,
    );

    function toggleStep(index: number, checked: boolean) {
        setCompletedSteps((current) => {
            if (checked) {
                return Array.from(new Set([...current, index])).sort(
                    (left, right) => left - right,
                );
            }

            return current.filter((stepIndex) => stepIndex !== index);
        });
    }

    function submitProgress(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const submitter = (event.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement | null;
        const action: RoadmapProgressAction =
            submitter?.value === 'update_cv' ? 'update_cv' : 'submit';

        setProcessingAction(action);

        router.post(
            roadmapProgress.url(),
            {
                job_id: jobId,
                completed_steps: completedSteps,
                action,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessingAction(null),
            },
        );
    }

    return (
        <form
            id={formId}
            onSubmit={submitProgress}
            className="mt-5 border-2 border-black bg-[#EDEADF] p-5 shadow-[5px_5px_0_#000]"
        >
            <h3 className="text-2xl leading-tight font-semibold tracking-tight text-[#111827]">
                {roadmap.title}
            </h3>
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#374151]">
                {roadmap.summary}
            </p>

            <div className="mt-5 grid gap-4">
                {roadmap.steps.map((step, index) => {
                    const checkboxId = `career-roadmap-${jobId}-${index}`;
                    const isCompleted = completedSteps.includes(index);

                    return (
                        <div
                            key={`${step.skill}-${step.estimated_time}`}
                            className="border-2 border-black bg-[#D8D8D2] p-4"
                        >
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <label
                                    htmlFor={checkboxId}
                                    className="flex min-h-12 items-start gap-3"
                                >
                                    <input
                                        id={checkboxId}
                                        name="completed_steps[]"
                                        type="checkbox"
                                        value={index}
                                        checked={isCompleted}
                                        onChange={(event) =>
                                            toggleStep(
                                                index,
                                                event.currentTarget.checked,
                                            )
                                        }
                                        className="mt-1 size-5 shrink-0 rounded-none border-2 border-black accent-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]"
                                    />
                                    <span>
                                        <span className="block text-sm font-bold tracking-wide uppercase">
                                            {step.skill}
                                        </span>
                                        <span className="mt-1 block text-base font-semibold text-[#111827]">
                                            {step.target_outcome}
                                        </span>
                                    </span>
                                </label>
                                <span className="border border-black bg-[#EDEADF] px-3 py-1 text-sm font-bold">
                                    {step.estimated_time}
                                </span>
                            </div>

                            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#111827]">
                                {step.learning_actions.map((action, index) => (
                                    <li
                                        key={action}
                                        className="pl-1 marker:text-black"
                                    >
                                        <span>{action}</span>{' '}
                                        <RoadmapActionSource
                                            source={
                                                step.learning_action_sources?.[
                                                    index
                                                ]
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>

                            <RoadmapSources sources={step.sources} />

                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <p className="border border-black bg-[#EDEADF] p-3 text-sm leading-6">
                                    <span className="block font-bold uppercase">
                                        Portfolio task
                                    </span>
                                    {step.portfolio_task}
                                </p>
                                <p className="border border-black bg-[#EDEADF] p-3 text-sm leading-6">
                                    <span className="block font-bold uppercase">
                                        CV proof
                                    </span>
                                    {step.cv_proof}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <RoadmapList title="Timeline" items={roadmap.timeline} />
        </form>
    );
}

function RoadmapActionSource({ source }: { source?: RoadmapSource }) {
    if (!source) {
        return null;
    }

    return (
        <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-9 shrink-0 items-center gap-1 border border-black bg-white px-2 py-1 text-sm font-semibold text-[#1E40AF] underline hover:bg-[#DBEAFE]"
        >
            Learn: {source.title}
            <ExternalLink className="size-3" />
        </a>
    );
}

function RoadmapSources({ sources }: { sources?: RoadmapSource[] }) {
    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 border border-black bg-[#EDEADF] p-3">
            <p className="text-xs font-bold tracking-wide uppercase">
                Learn from
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
                {sources.map((source) => (
                    <a
                        key={`${source.title}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center gap-1 border border-black bg-white px-2 py-1 text-sm font-semibold text-[#1E40AF] underline hover:bg-[#DBEAFE]"
                    >
                        {source.title}
                        <ExternalLink className="size-3" />
                    </a>
                ))}
            </div>
        </div>
    );
}

function RoadmapList({ title, items }: { title: string; items: string[] }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mt-5 border-2 border-black bg-[#E5E5E0] p-4">
            <p className="text-sm font-bold tracking-wide uppercase">{title}</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[#111827]">
                {items.map((item) => (
                    <li key={item}>- {item}</li>
                ))}
            </ul>
        </div>
    );
}

function EvidenceBlock({
    title,
    items,
    tone,
}: {
    title: string;
    items: string[];
    tone: 'good' | 'warn';
}) {
    return (
        <div
            className={
                tone === 'good'
                    ? 'border-2 border-black bg-[#DCFCE7] p-4'
                    : 'border-2 border-black bg-[#FFEDD5] p-4'
            }
        >
            <p className="mb-2 text-sm font-bold tracking-wide uppercase">
                {title}
            </p>
            <ul className="space-y-2 text-sm leading-6">
                {items.map((item) => (
                    <li key={item}>- {item}</li>
                ))}
            </ul>
        </div>
    );
}

CareerMatch.layout = {
    breadcrumbs: [
        {
            title: 'Vietnam Job Match',
            href: '/career-match',
        },
    ],
};
