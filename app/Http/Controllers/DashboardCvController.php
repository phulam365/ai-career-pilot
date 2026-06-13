<?php

namespace App\Http\Controllers;

use App\Http\Requests\DashboardCvUploadRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardCvController extends Controller
{
    /**
     * Store or replace the authenticated user's CV.
     */
    public function store(DashboardCvUploadRequest $request): RedirectResponse
    {
        $user = $request->user();
        $previousCvPath = $user->cv_path;
        $file = $request->file('cv');

        $path = $file->store('cvs/'.$user->id, 'local');

        $user->forceFill([
            'cv_path' => $path,
            'cv_original_name' => $file->getClientOriginalName(),
        ])->save();

        if (filled($previousCvPath) && $previousCvPath !== $path) {
            Storage::disk('local')->delete($previousCvPath);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('CV uploaded.')]);

        return to_route('dashboard');
    }

    /**
     * Download the authenticated user's private CV.
     */
    public function download(Request $request): StreamedResponse
    {
        $user = $request->user();

        abort_if(blank($user->cv_path) || blank($user->cv_original_name), 404);
        abort_unless(Storage::disk('local')->exists($user->cv_path), 404);

        return Storage::disk('local')->download($user->cv_path, $user->cv_original_name);
    }
}
