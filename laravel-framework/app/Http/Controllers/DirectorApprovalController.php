<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\ApprovalDecision;
use App\Models\AuditLog;
use App\Services\EsignBsreService;
use App\Services\PdfLetterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DirectorApprovalController extends Controller
{
    public function __construct(
        protected EsignBsreService $esignService,
        protected PdfLetterService $pdfService
    ) {}

    /**
     * Kadinkes Approval or Rejection decision with BSrE e-Signature
     */
    public function decide(Request $request, string $applicationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'decision' => 'required|in:approved,rejected,clarification_requested',
            'consideration_notes' => 'required|string|max:1000',
            'approved_check_in_date' => 'required_if:decision,approved|nullable|date',
            'approved_check_out_date' => 'required_if:decision,approved|nullable|date|after_or_equal:approved_check_in_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::with(['patient', 'companions', 'documents'])->findOrFail($applicationId);

        // Verification guard: Can only decide if currently admin_verified
        if ($application->status !== ApplicationStatus::ADMIN_VERIFIED) {
            return response()->json([
                'success' => false,
                'message' => 'Permohonan belum memenuhi syarat verifikasi administrasi untuk diputuskan oleh Kadinkes.',
            ], 422);
        }

        $user = $request->user();
        $decision = $request->input('decision');

        return DB::transaction(function () use ($application, $decision, $request, $user) {
            $checkIn = $request->input('approved_check_in_date')
                ?? $application->planned_check_in_date->format('Y-m-d');

            $checkOut = $request->input('approved_check_out_date')
                ?? $application->planned_check_in_date
                    ->copy()
                    ->addDays((int) $application->estimated_stay_days)
                    ->format('Y-m-d');

            // 1. Record decision
            $approvalDecision = ApprovalDecision::create([
                'application_id' => $application->id,
                'director_user_id' => $user->id,
                'director_name' => $user->name,
                'director_nip' => $user->nip,
                'decision' => $decision,
                'approved_check_in_date' => $decision === 'approved' ? $checkIn : null,
                'approved_check_out_date' => $decision === 'approved' ? $checkOut : null,
                'reason' => $request->input('consideration_notes'),
                'decided_at' => now(),
            ]);

            if ($decision === 'approved') {
                $application->update([
                    'status' => ApplicationStatus::APPROVED_DIRECTOR,
                ]);

                // 2. Dispatch BSrE Electronic Signature creation & Letter generation
                $letter = $this->esignService->generateSignedLetter(
                    $application,
                    $user,
                    $checkIn,
                    $checkOut,
                    $request->input('consideration_notes')
                );

                // 3. Render and store PDF document
                $this->pdfService->renderAndStorePdf($letter);

                AuditLog::logAction(
                    $user?->id,
                    'DIRECTOR_DECISION_APPROVED',
                    'Application',
                    $application->id,
                    "Permohonan disetujui Kadinkes dengan TTE BSrE. No Surat: {$letter->letter_number}",
                    ['letter_number' => $letter->letter_number, 'bsre_request_id' => $letter->bsre_request_id]
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Permohonan berhasil disetujui dan Surat Keputusan bertanda tangan elektronik (BSrE) telah terbit.',
                    'data' => [
                        'application' => $application->fresh(),
                        'decision' => $approvalDecision,
                        'letter' => $letter,
                    ],
                ]);
            }

            if ($decision === 'rejected') {
                $application->update([
                    'status' => ApplicationStatus::REJECTED_DIRECTOR,
                    'rejection_reason' => $request->input('consideration_notes'),
                ]);
            } else {
                $application->update([
                    'status' => ApplicationStatus::NEEDS_REVISION,
                    'rejection_reason' => $request->input('consideration_notes'),
                ]);
            }

            AuditLog::logAction(
                $user?->id,
                'DIRECTOR_DECISION_' . strtoupper($decision),
                'Application',
                $application->id,
                "Permohonan diputuskan: {$decision}",
                ['notes' => $request->input('consideration_notes')]
            );

            return response()->json([
                'success' => true,
                'message' => "Keputusan {$decision} berhasil disimpan.",
                'data' => [
                    'application' => $application->fresh(),
                    'decision' => $approvalDecision,
                ],
            ]);
        });
    }
}
