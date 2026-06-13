import { Form, Head } from '@inertiajs/react';
import {
    download,
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
};

export default function Dashboard({ hasCv, cvOriginalName }: DashboardProps) {
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
                                        accept=".pdf,.doc,.docx"
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
                                        Accepted formats: PDF, DOC, DOCX.
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
            </div>
        </>
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
