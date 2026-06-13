import { Form, Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ExternalLink,
    LoaderCircle,
    Map,
    Send,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
    download,
    roadmap,
    roadmapProgress,
    store,
} from '@/actions/App/Http/Controllers/DashboardCvController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

type DashboardProps = {
    hasCv: boolean;
    cvOriginalName: string | null;
    dashboardMatchAnalysis: MatchAnalysis | null;
    dashboardMatchError: string | null;
    dashboardRoadmap: DashboardRoadmap | null;
    openAiConfigured: boolean;
};

type JobResult = {
    id: string;
    title: string;
    company: string;
    source: string;
    url: string;
    location: string;
    suitable_rate: number;
    summary: string;
    missing_skills: string[];
};

type MatchAnalysis = {
    cv: {
        match_mode?: string;
    };
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

type DashboardRoadmap = {
    job_id: string;
    roadmap: Roadmap;
    completed_steps?: number[];
    progress_action?: RoadmapProgressAction;
};

type RoadmapProgressAction = 'update_cv' | 'submit';

export default function Dashboard({
    hasCv,
    cvOriginalName,
    dashboardMatchAnalysis,
    dashboardMatchError,
    dashboardRoadmap,
    openAiConfigured,
}: DashboardProps) {
    const [activeRoadmapJobId, setActiveRoadmapJobId] = useState<string | null>(
        null,
    );
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

    function generateRoadmap(job: JobResult) {
        setActiveRoadmapJobId(job.id);

        router.post(
            roadmap.url(),
            { job_id: job.id },
            {
                preserveScroll: true,
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
            <Head title="Dashboard" />

            <div className="paper-grid flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 text-ink md:p-8">
                <section className="max-w-5xl border-2 border-ink bg-paper p-6 shadow-hard-lg md:p-10">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <p className="inline-block -rotate-1 border-2 border-ink bg-warning px-3 py-2 font-bold tracking-[0.08em] uppercase shadow-hard-sm">
                                CV file
                            </p>
                            <div className="space-y-3">
                                <h1 className="max-w-[12ch] font-serif text-4xl leading-[0.98] font-semibold tracking-[-0.025em] text-text-deep md:text-6xl">
                                    Keep your resume ready for matching.
                                </h1>
                                <p className="max-w-[64ch] text-lg leading-8 text-text-muted">
                                    Upload one private CV in PDF, DOC, or DOCX
                                    format. A new upload replaces the previous
                                    file.
                                </p>
                            </div>
                        </div>

                        <div className="w-full border-2 border-ink bg-paper-muted p-5 shadow-hard-md lg:max-w-sm">
                            <p className="text-sm font-bold tracking-[0.05em] uppercase">
                                Current upload
                            </p>
                            {hasCv ? (
                                <div className="mt-4 space-y-4">
                                    <p className="border border-ink bg-paper p-3 text-base font-semibold break-words text-text-deep">
                                        {cvOriginalName}
                                    </p>
                                    <Button asChild variant="outline">
                                        <a href={download.url()}>Download CV</a>
                                    </Button>
                                </div>
                            ) : (
                                <p className="mt-4 border border-ink bg-paper p-3 text-text-muted">
                                    No CV uploaded yet.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <Form
                    {...store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess={['cv']}
                    className="max-w-5xl border-2 border-ink bg-paper-raised p-6 shadow-hard-lg md:p-8"
                >
                    {({ processing, progress, errors }) => {
                        const progressPercentage = Math.round(
                            progress?.percentage ?? 0,
                        );

                        return (
                            <fieldset
                                className="space-y-6"
                                disabled={processing}
                            >
                                <legend className="font-serif text-3xl leading-tight font-semibold tracking-[-0.025em] text-text-deep">
                                    {hasCv
                                        ? 'Replace your CV'
                                        : 'Upload your CV'}
                                </legend>

                                <div className="grid gap-3">
                                    <Label
                                        htmlFor="cv"
                                        className="text-base font-bold tracking-[0.08em] text-ink uppercase"
                                    >
                                        CV document
                                    </Label>

                                    <Input
                                        id="cv"
                                        name="cv"
                                        type="file"
                                        required
                                        accept=".pdf,.docx,.txt"
                                        aria-describedby="cv-help cv-error"
                                        aria-invalid={
                                            Boolean(errors.cv) || undefined
                                        }
                                        className="min-h-12 border-2 text-base"
                                    />

                                    <p
                                        id="cv-help"
                                        className="text-base leading-7 text-text-muted"
                                    >
                                        Accepted formats: PDF, DOCX, TXT.
                                        Maximum size: 5 MB.
                                    </p>

                                    <InputError
                                        id="cv-error"
                                        message={errors.cv}
                                        className="font-semibold text-destructive"
                                    />
                                </div>

                                {progress && (
                                    <div
                                        className="space-y-2"
                                        aria-live="polite"
                                        aria-label={`Upload progress ${progressPercentage}%`}
                                    >
                                        <div className="h-4 border-2 border-ink bg-paper">
                                            <div
                                                className="h-full bg-success"
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />
                                        </div>
                                        <p className="text-sm font-bold tracking-[0.05em] uppercase">
                                            Uploading {progressPercentage}%
                                        </p>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="-rotate-1 px-6 py-3"
                                >
                                    {processing
                                        ? 'Uploading...'
                                        : hasCv
                                          ? 'Replace CV'
                                          : 'Upload CV'}
                                </Button>
                            </fieldset>
                        );
                    }}
                </Form>

                {dashboardMatchError && (
                    <section className="max-w-5xl border-2 border-ink bg-paper p-5 shadow-hard-md">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="mt-1 size-5 shrink-0 text-warning" />
                            <div>
                                <h2 className="text-base font-bold tracking-[0.08em] uppercase">
                                    Match service skipped
                                </h2>
                                <p className="mt-2 text-base leading-7 text-text-muted">
                                    {dashboardMatchError}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                {dashboardMatchAnalysis && (
                    <section className="max-w-5xl border-2 border-ink bg-paper p-6 shadow-hard-lg md:p-8">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="inline-flex items-center gap-2 border-2 border-ink bg-warning px-3 py-2 text-sm font-bold tracking-[0.08em] uppercase shadow-hard-sm">
                                    <Map className="size-4" />
                                    Top 3 JD matches
                                </p>
                                <h2 className="mt-4 font-serif text-3xl leading-tight font-semibold tracking-[-0.025em] text-text-deep md:text-4xl">
                                    Click a row to generate a roadmap.
                                </h2>
                            </div>
                            <p className="max-w-sm text-sm leading-6 text-text-muted">
                                Match mode:{' '}
                                {dashboardMatchAnalysis.cv.match_mode ??
                                    'Fast demo matcher'}
                            </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 border-2 border-ink bg-paper-raised p-4 shadow-hard-sm sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-bold tracking-[0.08em] uppercase">
                                {selectedJobIds.length} job
                                {selectedJobIds.length === 1 ? '' : 's'}{' '}
                                selected
                            </p>
                            <Button
                                type="button"
                                disabled={selectedJobIds.length === 0}
                            >
                                <Send className="size-4" />
                                Send CV
                            </Button>
                        </div>

                        <div className="mt-6 grid gap-4">
                            {dashboardMatchAnalysis.results.map((job) => (
                                <div key={job.id} className="grid gap-3">
                                    <button
                                        type="button"
                                        onClick={() => generateRoadmap(job)}
                                        disabled={
                                            activeRoadmapJobId !== null ||
                                            !openAiConfigured
                                        }
                                        className="grid w-full gap-4 border-2 border-ink bg-paper-raised p-4 text-left shadow-hard-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 md:grid-cols-[1.2fr_0.9fr_1.1fr_0.8fr_auto]"
                                    >
                                        <RowCell
                                            label="Company"
                                            value={job.company}
                                        />
                                        <RowCell
                                            label="Source"
                                            value={job.source}
                                        />
                                        <RowCell
                                            label="URL"
                                            value={job.url}
                                            truncate
                                        />
                                        <RowCell
                                            label="Location"
                                            value={job.location}
                                        />
                                        <div className="flex items-center gap-2 self-center border-2 border-ink bg-paper px-3 py-2 text-sm font-bold">
                                            {job.missing_skills.length > 0 ? (
                                                <>
                                                    <AlertTriangle className="size-4 text-warning" />
                                                    Missing
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="size-4 text-success" />
                                                    Clear
                                                </>
                                            )}
                                        </div>
                                    </button>

                                    <div className="flex flex-wrap items-center gap-3 px-1 text-sm text-text-muted">
                                        <label className="inline-flex min-h-10 items-center gap-2 border border-ink bg-paper px-2 py-1 font-bold text-ink uppercase">
                                            <input
                                                type="checkbox"
                                                checked={selectedJobIds.includes(
                                                    job.id,
                                                )}
                                                onChange={(event) =>
                                                    toggleSelectedJob(
                                                        job.id,
                                                        event.currentTarget
                                                            .checked,
                                                    )
                                                }
                                                className="size-4 rounded-none border-2 border-ink accent-primary focus:ring-2 focus:ring-primary"
                                            />
                                            Select
                                        </label>
                                        <span className="font-bold text-ink">
                                            {job.title}
                                        </span>
                                        <span>{job.suitable_rate}% fit</span>
                                        <a
                                            href={job.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 font-semibold text-primary-strong underline"
                                        >
                                            Open JD
                                            <ExternalLink className="size-3" />
                                        </a>
                                        {activeRoadmapJobId === job.id && (
                                            <span className="inline-flex items-center gap-2 font-bold text-ink">
                                                <LoaderCircle className="size-4 animate-spin" />
                                                Generating roadmap
                                            </span>
                                        )}
                                        {!openAiConfigured && (
                                            <span className="font-semibold text-warning">
                                                Add OPENAI_API_KEY to generate
                                                roadmaps.
                                            </span>
                                        )}
                                        {dashboardRoadmap?.job_id ===
                                            job.id && (
                                            <>
                                                <Button
                                                    type="submit"
                                                    form={`dashboard-roadmap-progress-${job.id}`}
                                                    name="action"
                                                    value="update_cv"
                                                    className="bg-warning text-ink hover:bg-warning"
                                                >
                                                    Update CV
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    form={`dashboard-roadmap-progress-${job.id}`}
                                                    name="action"
                                                    value="submit"
                                                >
                                                    Submit
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {dashboardRoadmap?.job_id === job.id && (
                                        <RoadmapPanel
                                            formId={`dashboard-roadmap-progress-${job.id}`}
                                            jobId={job.id}
                                            roadmap={dashboardRoadmap.roadmap}
                                            completedSteps={
                                                dashboardRoadmap.completed_steps ??
                                                []
                                            }
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}

function RowCell({
    label,
    value,
    truncate = false,
}: {
    label: string;
    value: string;
    truncate?: boolean;
}) {
    return (
        <span className="min-w-0">
            <span className="block text-xs font-bold tracking-[0.08em] text-text-muted uppercase">
                {label}
            </span>
            <span
                className={
                    truncate
                        ? 'mt-1 block truncate font-semibold text-text-deep'
                        : 'mt-1 block font-semibold break-words text-text-deep'
                }
            >
                {value}
            </span>
        </span>
    );
}

function RoadmapPanel({
    formId,
    jobId,
    roadmap,
    completedSteps: initialCompletedSteps,
}: {
    formId: string;
    jobId: string;
    roadmap: Roadmap;
    completedSteps: number[];
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

        router.post(
            roadmapProgress.url(),
            {
                job_id: jobId,
                completed_steps: completedSteps,
                action,
            },
            {
                preserveScroll: true,
            },
        );
    }

    return (
        <form
            id={formId}
            onSubmit={submitProgress}
            className="border-2 border-ink bg-paper p-5 shadow-hard-md"
        >
            <h3 className="font-serif text-2xl leading-tight font-semibold tracking-[-0.025em] text-text-deep">
                {roadmap.title}
            </h3>
            <p className="mt-2 max-w-3xl text-base leading-7 text-text-muted">
                {roadmap.summary}
            </p>

            <div className="mt-5 grid gap-4">
                {roadmap.steps.map((step, index) => {
                    const checkboxId = `dashboard-roadmap-${jobId}-${index}`;
                    const isCompleted = completedSteps.includes(index);

                    return (
                        <div
                            key={`${step.skill}-${step.estimated_time}`}
                            className="border-2 border-ink bg-paper-muted p-4"
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
                                        className="mt-1 size-5 shrink-0 rounded-none border-2 border-ink accent-primary focus:ring-2 focus:ring-primary"
                                    />
                                    <span>
                                        <span className="block text-sm font-bold tracking-[0.08em] uppercase">
                                            {step.skill}
                                        </span>
                                        <span className="mt-1 block text-base font-semibold text-text-deep">
                                            {step.target_outcome}
                                        </span>
                                    </span>
                                </label>
                                <span className="border border-ink bg-paper px-3 py-1 text-sm font-bold">
                                    {step.estimated_time}
                                </span>
                            </div>

                            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-text-deep">
                                {step.learning_actions.map((action, index) => (
                                    <li
                                        key={action}
                                        className="pl-1 marker:text-ink"
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
                                <p className="border border-ink bg-paper p-3 text-sm leading-6">
                                    <span className="block font-bold uppercase">
                                        Portfolio task
                                    </span>
                                    {step.portfolio_task}
                                </p>
                                <p className="border border-ink bg-paper p-3 text-sm leading-6">
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
            className="inline-flex min-h-9 shrink-0 items-center gap-1 border border-ink bg-paper-raised px-2 py-1 text-sm font-semibold text-primary-strong underline hover:bg-paper-muted"
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
        <div className="mt-4 border border-ink bg-paper p-3">
            <p className="text-xs font-bold tracking-[0.08em] uppercase">
                Learn from
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
                {sources.map((source) => (
                    <a
                        key={`${source.title}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center gap-1 border border-ink bg-paper-raised px-2 py-1 text-sm font-semibold text-primary-strong underline hover:bg-paper-muted"
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
        <div className="mt-5 border-2 border-ink bg-paper-raised p-4">
            <p className="text-sm font-bold tracking-[0.08em] uppercase">
                {title}
            </p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-text-deep">
                {items.map((item) => (
                    <li key={item}>- {item}</li>
                ))}
            </ul>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
