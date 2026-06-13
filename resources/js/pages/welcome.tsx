import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

const workflowSteps = [
    {
        label: '01',
        title: 'Describe your target',
        body: 'Choose a role, seniority level, preferred market, and how much time you can realistically study each week.',
    },
    {
        label: '02',
        title: 'Map your current signal',
        body: 'Add your CV, projects, tools, coursework, and work history so the plan starts from evidence instead of wishful thinking.',
    },
    {
        label: '03',
        title: 'Prioritize the gaps',
        body: 'See which missing skills matter most for the role and which ones can wait until after the next application cycle.',
    },
    {
        label: '04',
        title: 'Work the plan',
        body: 'Follow weekly actions with portfolio tasks, interview drills, and review checkpoints that keep progress measurable.',
    },
];

const roleOutcomes = [
    'Skill gaps ranked by hiring impact',
    'Role-specific project ideas for your portfolio',
    'Weekly learning blocks matched to your schedule',
    'Application-readiness notes for your CV',
    'Interview practice themes based on weak spots',
    'Progress checkpoints that are easy to review',
];

const examplePlan = [
    {
        week: 'Week 1',
        title: 'Baseline and shortlist',
        details:
            'Confirm target roles, clean up CV evidence, and pick three representative job descriptions.',
    },
    {
        week: 'Week 2',
        title: 'Close the most visible gap',
        details:
            'Build one focused mini-project around the highest-impact missing skill.',
    },
    {
        week: 'Week 3',
        title: 'Package proof',
        details:
            'Turn the project into portfolio notes, CV bullets, and interview talking points.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const primaryHref = auth.user ? dashboard() : register();
    const primaryLabel = auth.user ? 'Open dashboard' : 'Start planning';

    return (
        <>
            <Head title="AI Career Pilot" />

            <div className="min-h-screen bg-[#EDEADF] bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:40px_40px] p-5 text-[#000000] sm:p-8">
                <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-2 border-black bg-[#E5E5E0] p-4 shadow-[6px_6px_0_#000]">
                    <Link
                        href="/"
                        className="border-2 border-black bg-[#F97316] px-3 py-2 font-semibold tracking-[0.08em] uppercase shadow-[3px_3px_0_#000]"
                    >
                        AI Career Pilot
                    </Link>

                    <nav className="flex flex-wrap items-center gap-3 text-sm font-semibold tracking-[0.05em] uppercase">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="border-2 border-black bg-[#1D4ED8] px-4 py-2 text-white shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDEADF] focus-visible:outline-none"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="border-2 border-black bg-[#EDEADF] px-4 py-2 shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDEADF] focus-visible:outline-none"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="border-2 border-black bg-[#1D4ED8] px-4 py-2 text-white shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDEADF] focus-visible:outline-none"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto max-w-6xl py-14 sm:py-16 lg:py-20">
                    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
                        <div className="border-2 border-black bg-[#EDEADF] p-7 shadow-[8px_8px_0_#000] sm:p-12">
                            <p className="mb-5 inline-block -rotate-1 border-2 border-black bg-[#F97316] px-3 py-2 text-sm font-bold tracking-[0.08em] uppercase shadow-[3px_3px_0_#000]">
                                Career planning, sharper
                            </p>

                            <h1 className="max-w-4xl text-5xl leading-[0.98] font-semibold tracking-normal text-[#111827] sm:text-7xl">
                                Turn scattered career goals into a practical
                                next move.
                            </h1>

                            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#374151] sm:text-xl">
                                AI Career Pilot helps learners compare their
                                skills with target roles, spot the most useful
                                gaps, and build a focused learning path instead
                                of guessing what to study next.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold tracking-[0.05em] uppercase">
                                <Link
                                    href={primaryHref}
                                    className="-rotate-1 border-2 border-black bg-[#1D4ED8] px-5 py-3 text-white shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDEADF] focus-visible:outline-none"
                                >
                                    {primaryLabel}
                                </Link>
                                {!auth.user && (
                                    <Link
                                        href={login()}
                                        className="border-2 border-black bg-[#EDEADF] px-5 py-3 shadow-[6px_6px_0_#000] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDEADF] focus-visible:outline-none"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>

                        <aside className="grid gap-5 border-2 border-black bg-[#D8D8D2] p-6 shadow-[8px_8px_0_#000] sm:p-8">
                            <div>
                                <p className="text-sm font-bold tracking-[0.08em] uppercase">
                                    The idea in brief
                                </p>
                                <h2 className="mt-3 text-3xl leading-tight font-semibold text-[#111827]">
                                    A career cockpit for deciding what to learn,
                                    prove, and apply for next.
                                </h2>
                            </div>

                            <dl className="grid gap-4">
                                <div className="border-2 border-black bg-[#EDEADF] p-4">
                                    <dt className="text-sm font-bold tracking-[0.08em] uppercase">
                                        Input
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-[#374151]">
                                        Current experience, target role, CV
                                        evidence, projects, and weekly learning
                                        constraints.
                                    </dd>
                                </div>
                                <div className="border-2 border-black bg-[#EDEADF] p-4">
                                    <dt className="text-sm font-bold tracking-[0.08em] uppercase">
                                        Output
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-[#374151]">
                                        A clear skill-gap summary, role-fit
                                        notes, project ideas, and a realistic
                                        plan for the next few weeks.
                                    </dd>
                                </div>
                                <div className="border-2 border-black bg-[#EDEADF] p-4">
                                    <dt className="text-sm font-bold tracking-[0.08em] uppercase">
                                        Goal
                                    </dt>
                                    <dd className="mt-2 text-base leading-7 text-[#374151]">
                                        Make career progress measurable,
                                        personal, and easier to act on.
                                    </dd>
                                </div>
                            </dl>
                        </aside>
                    </section>

                    <section className="mt-12 border-2 border-black bg-[#E5E5E0] p-6 shadow-[8px_8px_0_#000] sm:p-10">
                        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                            <div>
                                <p className="inline-block rotate-1 border-2 border-black bg-[#15803D] px-3 py-2 text-sm font-bold tracking-[0.08em] text-white uppercase shadow-[3px_3px_0_#000]">
                                    How it works
                                </p>
                                <h2 className="mt-5 max-w-xl text-4xl leading-none font-semibold text-[#111827] sm:text-5xl">
                                    From ambition to a plan you can actually
                                    finish.
                                </h2>
                                <p className="mt-5 max-w-prose text-lg leading-8 text-[#374151]">
                                    The page does not stop at generic advice. It
                                    narrows your next move by comparing your
                                    background against the role you want and the
                                    time you have.
                                </p>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {workflowSteps.map((step) => (
                                    <article
                                        key={step.label}
                                        className="border-2 border-black bg-[#EDEADF] p-5 shadow-[4px_4px_0_#000]"
                                    >
                                        <span className="grid size-12 place-items-center border-2 border-black bg-[#F97316] text-sm font-bold shadow-[3px_3px_0_#000]">
                                            {step.label}
                                        </span>
                                        <h3 className="mt-5 text-2xl leading-tight font-semibold text-[#111827]">
                                            {step.title}
                                        </h3>
                                        <p className="mt-3 text-base leading-7 text-[#374151]">
                                            {step.body}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
                        <div className="border-2 border-black bg-[#EDEADF] p-6 shadow-[8px_8px_0_#000] sm:p-10">
                            <p className="text-sm font-bold tracking-[0.08em] uppercase">
                                What you get
                            </p>
                            <h2 className="mt-4 text-4xl leading-none font-semibold text-[#111827] sm:text-5xl">
                                More useful than a list of courses.
                            </h2>
                            <p className="mt-5 max-w-prose text-lg leading-8 text-[#374151]">
                                AI Career Pilot is meant to help you decide what
                                deserves attention now. Each recommendation ties
                                back to your role target, evidence, and current
                                readiness.
                            </p>

                            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                                {roleOutcomes.map((outcome) => (
                                    <li
                                        key={outcome}
                                        className="border-2 border-black bg-[#D8D8D2] p-4 text-base leading-7 font-semibold text-[#111827]"
                                    >
                                        {outcome}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <aside className="border-2 border-black bg-[#D8D8D2] p-6 shadow-[8px_8px_0_#000] sm:p-8">
                            <p className="inline-block -rotate-1 border-2 border-black bg-[#1D4ED8] px-3 py-2 text-sm font-bold tracking-[0.08em] text-white uppercase shadow-[3px_3px_0_#000]">
                                Sample output
                            </p>
                            <h2 className="mt-5 text-3xl leading-tight font-semibold text-[#111827]">
                                A three-week sprint for a junior data analyst
                                target.
                            </h2>

                            <div className="mt-6 grid gap-4">
                                {examplePlan.map((item) => (
                                    <article
                                        key={item.week}
                                        className="border-2 border-black bg-[#EDEADF] p-4"
                                    >
                                        <p className="text-sm font-bold tracking-[0.08em] uppercase">
                                            {item.week}
                                        </p>
                                        <h3 className="mt-2 text-xl font-semibold text-[#111827]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-2 text-base leading-7 text-[#374151]">
                                            {item.details}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </aside>
                    </section>

                    <section className="mt-12 border-2 border-black bg-[#111827] p-6 text-white shadow-[8px_8px_0_#000] sm:p-10">
                        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                            <div>
                                <p className="text-sm font-bold tracking-[0.08em] text-[#F97316] uppercase">
                                    Ready when your next move matters
                                </p>
                                <h2 className="mt-4 max-w-3xl text-4xl leading-none font-semibold sm:text-5xl">
                                    Stop collecting random advice. Build the
                                    next proof point your target role needs.
                                </h2>
                            </div>

                            <Link
                                href={primaryHref}
                                className="w-fit border-2 border-black bg-[#F97316] px-5 py-3 text-sm font-bold tracking-[0.08em] text-black uppercase shadow-[6px_6px_0_#EDEADF] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] focus-visible:outline-none"
                            >
                                {primaryLabel}
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
