import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center border-2 border-ink bg-sidebar-primary text-sidebar-primary-foreground shadow-hard-sm">
                <AppLogoIcon className="size-5 fill-current text-inverse" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm text-sidebar-foreground">
                <span className="mb-0.5 truncate leading-tight font-bold tracking-[0.05em] uppercase">
                    Laravel Starter Kit
                </span>
            </div>
        </>
    );
}
