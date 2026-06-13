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

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto bg-[#EDEADF] bg-[linear-gradient(to_right,rgba(0,0,0,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.045)_1px,transparent_1px)] bg-[size:40px_40px] p-4 text-black md:p-8">
                <section className="max-w-5xl border-2 border-black bg-[#EDEADF] p-6 shadow-[8px_8px_0_#000] md:p-10">
                    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-2xl space-y-4">
                            <p className="inline-block -rotate-1 border-2 border-black bg-[#F97316] px-3 py-2 font-semibold tracking-[0.08em] uppercase shadow-[3px_3px_0_#000]">
                                CV file
                            </p>
                            <div className="space-y-3">
                                <h1 className="font-serif text-4xl leading-[0.98] font-semibold tracking-[-0.025em] text-[#111827] md:text-6xl">
                                    Keep your resume ready for matching.
                                </h1>
                                <p className="max-w-[64ch] text-lg leading-8 text-[#374151]">
                                    Upload one private CV in PDF, DOC, or DOCX
                                    format. A new upload replaces the previous
                                    file.
                                </p>
                            </div>
                        </div>

                        <div className="w-full border-2 border-black bg-[#D8D8D2] p-5 shadow-[6px_6px_0_#000] lg:max-w-sm">
                            <p className="text-sm font-bold tracking-[0.05em] uppercase">
                                Current upload
                            </p>
                            {hasCv ? (
                                <div className="mt-4 space-y-4">
                                    <p className="break-words border border-black bg-[#EDEADF] p-3 text-base font-semibold text-[#111827]">
                                        {cvOriginalName}
                                    </p>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="min-h-11 rounded-none border-2 border-black bg-[#EDEADF] px-4 font-semibold tracking-[0.08em] uppercase shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 hover:bg-black hover:text-white active:translate-x-1 active:translate-y-1 active:shadow-none"
                                    >
                                        <a href={download.url()}>Download CV</a>
                                    </Button>
                                </div>
                            ) : (
                                <p className="mt-4 border border-black bg-[#EDEADF] p-3 text-[#374151]">
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
                    className="max-w-5xl border-2 border-black bg-[#E5E5E0] p-6 shadow-[8px_8px_0_#000] md:p-8"
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
                                <legend className="font-serif text-3xl leading-tight font-semibold tracking-[-0.025em] text-[#111827]">
                                    {hasCv
                                        ? 'Replace your CV'
                                        : 'Upload your CV'}
                                </legend>

                                <div className="grid gap-3">
                                    <Label
                                        htmlFor="cv"
                                        className="text-base font-bold tracking-[0.08em] uppercase"
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
                                        className="min-h-12 rounded-none border-2 border-black bg-white text-base shadow-[3px_3px_0_#000] file:mr-4 file:border-0 file:bg-[#1D4ED8] file:px-3 file:py-1 file:text-sm file:font-bold file:tracking-[0.05em] file:text-white file:uppercase focus-visible:border-black focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E5E5E0]"
                                    />

                                    <p
                                        id="cv-help"
                                        className="text-base leading-7 text-[#374151]"
                                    >
                                        Accepted formats: PDF, DOC, DOCX.
                                        Maximum size: 5 MB.
                                    </p>

                                    <InputError
                                        id="cv-error"
                                        message={errors.cv}
                                        className="font-semibold text-[#DC2626]"
                                    />
                                </div>

                                {progress && (
                                    <div
                                        className="space-y-2"
                                        aria-live="polite"
                                        aria-label={`Upload progress ${progressPercentage}%`}
                                    >
                                        <div className="h-4 border-2 border-black bg-[#EDEADF]">
                                            <div
                                                className="h-full bg-[#15803D]"
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
                                    className="-rotate-1 rounded-none border-2 border-black bg-[#1D4ED8] px-6 py-3 font-bold tracking-[0.08em] text-white uppercase shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5 hover:bg-[#1E40AF] active:translate-x-1 active:translate-y-1 active:shadow-none"
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
