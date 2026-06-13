import { Head, useForm } from '@inertiajs/react';
import {
    ExternalLink,
    FileSearch,
    Link2,
    SearchCheck,
    Upload,
} from 'lucide-react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

type SourceLink = {
    source: string;
    url: string;
    note: string;
};

type Analysis = {
    cv: {
        filename: string;
        word_count: number;
        detected_skills: string[];
        target_role: string;
        location: string;
        match_mode?: string;
    };
    results: JobResult[];
    source_links: SourceLink[];
};

type Props = {
    analysis: Analysis | null;
    openAiConfigured: boolean;
    targetRoles: string[];
};

export default function CareerMatch({
    analysis,
    openAiConfigured,
    targetRoles,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        cv: null as File | null,
        target_role: 'Auto-detect',
        location: 'Vietnam',
        match_mode: 'fast_demo',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post('/career-match', {
            forceFormData: true,
            preserveScroll: true,
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
                                    Upload a CV. Find the nearest Vietnam IT
                                    roles.
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
                                        <div className="grid grid-cols-2 border-2 border-black bg-white">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setData(
                                                        'match_mode',
                                                        'fast_demo',
                                                    )
                                                }
                                                className={
                                                    data.match_mode ===
                                                    'fast_demo'
                                                        ? 'min-h-11 bg-[#F97316] px-3 text-sm font-black uppercase'
                                                        : 'min-h-11 bg-white px-3 text-sm font-bold uppercase'
                                                }
                                            >
                                                Fast demo
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!openAiConfigured}
                                                onClick={() =>
                                                    setData(
                                                        'match_mode',
                                                        'live_openai',
                                                    )
                                                }
                                                className={
                                                    data.match_mode ===
                                                    'live_openai'
                                                        ? 'min-h-11 border-l-2 border-black bg-[#1D4ED8] px-3 text-sm font-black text-white uppercase disabled:bg-[#9CA3AF]'
                                                        : 'min-h-11 border-l-2 border-black bg-white px-3 text-sm font-bold uppercase disabled:bg-[#D1D5DB] disabled:text-[#6B7280]'
                                                }
                                            >
                                                Live web
                                            </button>
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
                        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                            <aside className="space-y-6">
                                <Card className="rounded-none border-2 border-black bg-[#E5E5E0] shadow-[6px_6px_0_#000]">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileSearch className="size-5" />
                                            CV Snapshot
                                        </CardTitle>
                                        <CardDescription>
                                            {analysis.cv.filename}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <Metric
                                                label="Words"
                                                value={analysis.cv.word_count}
                                            />
                                            <Metric
                                                label="Role"
                                                value={analysis.cv.target_role}
                                            />
                                            <Metric
                                                label="Mode"
                                                value={
                                                    analysis.cv.match_mode ??
                                                    'Fast demo matcher'
                                                }
                                            />
                                        </div>

                                        <div>
                                            <p className="mb-2 text-sm font-semibold tracking-wide uppercase">
                                                Detected skills
                                            </p>
                                            <SkillList
                                                skills={
                                                    analysis.cv.detected_skills
                                                }
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-none border-2 border-black bg-[#E5E5E0] shadow-[6px_6px_0_#000]">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Link2 className="size-5" />
                                            Live Source Links
                                        </CardTitle>
                                        <CardDescription>
                                            Open these searches to inspect
                                            current postings.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {analysis.source_links.map((source) => (
                                            <a
                                                key={source.source}
                                                href={source.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5"
                                            >
                                                <span className="flex items-center justify-between gap-3 font-semibold">
                                                    {source.source}
                                                    <ExternalLink className="size-4" />
                                                </span>
                                                <span className="mt-1 block text-sm text-[#374151]">
                                                    {source.note}
                                                </span>
                                            </a>
                                        ))}
                                    </CardContent>
                                </Card>
                            </aside>

                            <div className="space-y-6">
                                {analysis.results.map((job, index) => (
                                    <JobMatchCard
                                        key={job.id}
                                        job={job}
                                        rank={index + 1}
                                    />
                                ))}
                            </div>
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

function Metric({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="border-2 border-black bg-white p-3 shadow-[3px_3px_0_#000]">
            <p className="text-xs font-bold tracking-wide text-[#374151] uppercase">
                {label}
            </p>
            <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
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

function JobMatchCard({ job, rank }: { job: JobResult; rank: number }) {
    return (
        <article className="border-2 border-black bg-[#E5E5E0] p-5 shadow-[6px_6px_0_#000]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <div className="mb-3 inline-flex size-12 items-center justify-center border-2 border-black bg-[#F97316] text-lg font-black shadow-[3px_3px_0_#000]">
                        {rank}
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
                <Button
                    asChild
                    className="rounded-none border-2 border-black bg-[#1D4ED8] font-bold tracking-wide text-white uppercase shadow-[4px_4px_0_#000] hover:bg-[#1E40AF]"
                >
                    <a href={job.url} target="_blank" rel="noreferrer">
                        Open job search
                        <ExternalLink className="size-4" />
                    </a>
                </Button>
            </div>
        </article>
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
