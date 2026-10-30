<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminVerificationController extends Controller
{
    /**
     * List all applications with filtering and pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Application::with(['patient', 'companions', 'documents.requirement', 'approvalLetter', 'roomAssignment.room']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $term = $request->query('search');
            $query->where(function ($q) use ($term) {
                $q->where('application_number', 'like', "%{$term}%")
                  ->orWhereHas('patient', function ($pq) use ($term) {
                      $pq->where('full_name', 'like', "%{$term}%")
                         ->orWhere('nik', 'like', "%{$term}%");
                  });
            });
        }

        $applications = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $applications,
        ]);
    }

    /**
     * Get single application details with full relations
     */
    public function show(string $id): JsonResponse
    {
        $application = Application::with([
            'patient',
            'companions',
            'documents.requirement',
            'decisions.director',
            'approvalLetter',
            'roomAssignment.room',
            'roomAssignment.bed',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Review an individual document item (Valid, Invalid, Needs Revision)
     */
    public function reviewDocument(Request $request, string $documentId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:verified,rejected,needs_revision',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $document = ApplicationDocument::with('application')->findOrFail($documentId);
        $user = $request->user();

        $document->update([
            'verification_status' => $request->input('status'),
            'verification_notes' => $request->input('notes'),
            'verified_by_user_id' => $user?->id,
            'verified_at' => now(),
        ]);

        AuditLog::logAction(
            $user?->id,
            'DOCUMENT_REVIEW',
            'ApplicationDocument',
            $document->id,
            "Document #{$document->file_name} marked as {$request->input('status')}",
            ['application_number' => $document->application->application_number, 'status' => $request->input('status')]
        );

        return response()->json([
            'success' => true,
            'message' => 'Status verifikasi berkas berhasil diperbarui',
            'data' => $document,
        ]);
    }

    /**
     * Finalize administrative verification for the whole application
     * Mandatory gating rule: ALL mandatory documents must be 'verified'
     */
    public function finalizeVerification(Request $request, string $applicationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:verified,needs_revision,rejected',
            'notes' => 'required_if:action,needs_revision,rejected|nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::with(['documents.requirement', 'patient'])->findOrFail($applicationId);
        $user = $request->user();
        $action = $request->input('action');

        if ($action === 'verified') {
            // Check gating rule: all mandatory requirements must have verified documents
            $unverifiedMandatory = $application->documents->filter(function ($doc) {
                return $doc->requirement && $doc->requirement->is_mandatory && $doc->verification_status !== 'verified';
            });

            if ($unverifiedMandatory->isNotEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal verifikasi: Masih terdapat dokumen wajib yang belum diverifikasi valid.',
                    'pending_documents' => $unverifiedMandatory->pluck('requirement.name'),
                ], 422);
            }

            $newStatus = ApplicationStatus::ADMIN_VERIFIED;
        } elseif ($action === 'needs_revision') {
            $newStatus = ApplicationStatus::NEEDS_REVISION;
        } else {
            $newStatus = ApplicationStatus::REJECTED_ADMIN;
        }

        DB::transaction(function () use ($application, $newStatus, $request, $user) {
            $application->update([
                'status' => $newStatus,
                'rejection_reason' => in_array($newStatus, [ApplicationStatus::NEEDS_REVISION, ApplicationStatus::REJECTED_ADMIN])
                    ? $request->input('notes')
                    : null,
            ]);

            AuditLog::logAction(
                $user?->id,
                'ADMIN_VERIFICATION_FINALIZED',
                'Application',
                $application->id,
                "Permohonan diubah status menjadi: {$newStatus->value}",
                ['application_number' => $application->application_number, 'notes' => $request->input('notes')]
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Verifikasi administrasi berhasil diproses',
            'data' => $application->fresh(),
        ]);
    }
}
