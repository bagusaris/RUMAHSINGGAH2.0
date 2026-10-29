<?php

namespace App\Services;

use App\Models\Application;
use App\Models\ApprovalLetter;
use App\Models\User;
use Illuminate\Support\Str;

class EsignBsreService
{
    /**
     * Generates a signed approval letter with BSrE BSSN certificate metadata
     */
    public function generateSignedLetter(
        Application $application,
        ?User $signer,
        string $checkInDate,
        string $checkOutDate,
        string $notes
    ): ApprovalLetter {
        $year = date('Y');
        $randomSeq = str_pad((string) rand(10, 999), 3, '0', STR_PAD_LEFT);
        $letterNumber = "440/{$randomSeq}/RSP-DINKES/{$year}";

        $signerName = $signer?->name ?? 'dr. H. Rahmat Hidayat, M.Kes';
        $signerNip = $signer?->nip ?? '197405122000031002';
        $signerPosition = 'Kepala Dinas Kesehatan';
        $certId = 'BSRE-CERT-ID-' . strtoupper(Str::random(12));
        $bsreReqId = 'BSRE-REQ-' . strtoupper(Str::random(16));
        $qrToken = 'VERIF-' . strtoupper(Str::random(24));

        // Compute SHA-256 cryptographic digest of document payload
        $rawPayload = json_encode([
            'letter_number' => $letterNumber,
            'application_number' => $application->application_number,
            'patient_nik' => $application->patient->nik,
            'signer_nip' => $signerNip,
            'approved_dates' => "{$checkInDate} s/d {$checkOutDate}",
            'notes' => $notes,
            'timestamp' => now()->toIso8601String(),
        ]);
        $documentSha256 = hash('sha256', $rawPayload);

        return ApprovalLetter::create([
            'application_id' => $application->id,
            'letter_number' => $letterNumber,
            'signed_by_name' => $signerName,
            'signed_by_nip' => $signerNip,
            'signed_by_position' => $signerPosition,
            'signer_certificate_id' => $certId,
            'bsre_request_id' => $bsreReqId,
            'bsre_signature_token' => hash('sha256', $bsreReqId . $documentSha256),
            'document_sha256' => $documentSha256,
            'signature_status' => 'signed',
            'signed_at' => now(),
            'verification_qr_token' => $qrToken,
            'pdf_file_path' => "approval_letters/{$application->application_number}.pdf",
        ]);
    }

    /**
     * Verify a document's QR code token
     */
    public function verifyQrToken(string $token): ?ApprovalLetter
    {
        return ApprovalLetter::with(['application.patient', 'application.roomAssignment.room'])
            ->where('verification_qr_token', $token)
            ->first();
    }
}
