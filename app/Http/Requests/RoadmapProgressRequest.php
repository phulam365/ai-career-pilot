<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoadmapProgressRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_id' => ['required', 'string', 'max:160'],
            'completed_steps' => ['nullable', 'array'],
            'completed_steps.*' => ['integer', 'min:0'],
            'action' => ['required', Rule::in(['update_cv', 'submit'])],
        ];
    }
}
