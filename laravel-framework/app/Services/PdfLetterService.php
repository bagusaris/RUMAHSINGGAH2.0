<?php

namespace App\Services;

use App\Models\ApprovalLetter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PdfLetterService
{
    /**
     * Render and store the formal Indonesian government approval letter as PDF
     */
    public function renderAndStorePdf(ApprovalLetter $letter): string
    {
        $application = $letter->application()->with(['patient', 'companions', 'roomAssignment.room'])->first();
        
        $verificationUrl = config('app.url') . "/verifikasi?token=" . urlencode($letter->verification_qr_token);
        
        // Generate Base64 SVG or PNG for the QR Code
        $qrCodeImage = '';
        if (class_exists(QrCode::class)) {
            $qrCodeImage = base64_encode(QrCode::format('png')->size(120)->generate($verificationUrl));
        }

        // Render blade view to HTML
        $html = view('letters.approval_letter', [
            'letter' => $letter,
            'application' => $application,
            'patient' => $application->patient,
            'companions' => $application->companions,
            'verificationUrl' => $verificationUrl,
            'qrCodeImage' => $qrCodeImage,
        ])->render();

        $pdfPath = "approval_letters/{$application->application_number}.pdf";

        // If DomPDF package is available, compile to binary stream
        if (class_exists(Pdf::class)) {
            $pdf = Pdf::loadHTML($html)->setPaper('a4', 'portrait');
            Storage::disk('private')->put($pdfPath, $pdf->output());
        } else {
            // Fallback storage of HTML snapshot for conversion
            Storage::disk('private')->put(str_replace('.pdf', '.html', $pdfPath), $html);
        }

        $letter->update([
            'pdf_file_path' => $pdfPath,
        ]);

        return $pdfPath;
    }
}
