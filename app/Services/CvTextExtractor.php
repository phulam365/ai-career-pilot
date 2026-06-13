<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use RuntimeException;
use ZipArchive;

class CvTextExtractor
{
    public function extract(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());

        $text = match ($extension) {
            'txt' => $this->extractTextFile($file),
            'docx' => $this->extractDocx($file),
            'pdf' => $this->extractPdfText($file),
            default => throw new RuntimeException('Unsupported CV format. Upload a PDF, DOCX, or TXT file.'),
        };

        return $this->normalizeWhitespace($text);
    }

    private function extractTextFile(UploadedFile $file): string
    {
        $contents = file_get_contents($file->getRealPath());

        if ($contents === false) {
            throw new RuntimeException('Could not read the uploaded CV.');
        }

        return $contents;
    }

    private function extractDocx(UploadedFile $file): string
    {
        if (! class_exists(ZipArchive::class)) {
            throw new RuntimeException('DOCX parsing is not available on this server. Upload a PDF or TXT CV instead.');
        }

        $archive = new ZipArchive;

        if ($archive->open($file->getRealPath()) !== true) {
            throw new RuntimeException('Could not open the uploaded DOCX file.');
        }

        $documentXml = $archive->getFromName('word/document.xml');
        $archive->close();

        if ($documentXml === false) {
            throw new RuntimeException('Could not extract text from the uploaded DOCX file.');
        }

        $documentXml = preg_replace('/<\/w:p>/', "\n", $documentXml) ?? $documentXml;
        $documentXml = preg_replace('/<w:tab\/>/', "\t", $documentXml) ?? $documentXml;

        return html_entity_decode(strip_tags($documentXml), ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private function extractPdfText(UploadedFile $file): string
    {
        $contents = file_get_contents($file->getRealPath());

        if ($contents === false) {
            throw new RuntimeException('Could not read the uploaded PDF file.');
        }

        preg_match_all('/\(((?:\\\\.|[^\\\\)])*)\)\s*Tj/s', $contents, $matches);

        $parts = array_map(
            fn (string $value): string => $this->decodePdfString($value),
            $matches[1] ?? [],
        );

        $text = trim(implode("\n", $parts));

        if ($text !== '') {
            return $text;
        }

        $roughText = preg_replace('/[^A-Za-z0-9@\.\+\-\s\/:#,]/', ' ', $contents) ?? '';

        return $roughText;
    }

    private function decodePdfString(string $value): string
    {
        $value = str_replace(
            ['\\\\', '\(', '\)', '\n', '\r', '\t'],
            ['\\', '(', ')', "\n", "\r", "\t"],
            $value,
        );

        return trim($value);
    }

    private function normalizeWhitespace(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/[ \t]+/', ' ', $text) ?? $text;
        $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;

        return trim($text);
    }
}
