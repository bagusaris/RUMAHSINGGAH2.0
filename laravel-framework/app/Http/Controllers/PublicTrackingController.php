<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class PublicTrackingController extends Controller
{
    /**
     * Pelacakan mandiri tri-faktor (Nomor Permohonan + 4 digit NIK + 6 digit Kode Akses)
     * Dilengkapi Rate Limiting dan Anti-Brute Force Lockout
     */
    public function track(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_number' => ['required', 'string'],
            'nik_last_4' => ['required', 'digits:4'],
            'access_code' => ['required', 'digits:6'],
        ]);

        $throttleKey = 'tracking:' . $request->ip();

        // 1. Rate Limiting IP: Maksimal 10 percobaan per 2 menit
        if (RateLimiter::tooManyAttempts($throttleKey, 10)) {
            $retryAfter = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'success' => false,
                'message' => "Terlalu banyak permintaan pelacakan. Silakan tunggu {$retryAfter} detik."
            ], 429);
        }

        $app = Application::with(['patient', 'documents', 'approvalLetter', 'roomAssignment'])
            ->where('application_number', trim($validated['application_number']))
            ->first();

        $genericError = 'Kombinasi Nomor Permohonan, 4 digit NIK, atau Kode Akses tidak sesuai.';

        if (!$app) {
            RateLimiter::hit($throttleKey, 120);
            return response()->json(['success' => false, 'message' => $genericError], 401);
        }

        if ($app->is_locked) {
            return response()->json([
                'success' => false,
                'is_locked' => true,
                'message' => 'Permohonan ini telah dikunci sementara karena melebihi batas percobaan. Hubungi Call Center Dinas Kesehatan.'
            ], 403);
        }

        // 2. Verifikasi 4 digit NIK & Hash Kode Akses
        $isNikValid = str_ends_with($app->patient->nik, $validated['nik_last_4']);
        $isCodeValid = Hash::check($validated['access_code'], $app->access_code_hash);

        if (!$isNikValid || !$isCodeValid) {
            RateLimiter::hit($throttleKey, 120);
            $app->increment('tracking_attempts');
            $app->update(['last_tracking_attempt_at' => now()]);

            if ($app->tracking_attempts >= 5) {
                $app->update(['is_locked' => true]);
                return response()->json([
                    'success' => false,
                    'is_locked' => true,
                    'message' => 'Batas percobaan (5x) terlampaui. Akses permohonan dikunci demi keamanan data pribadi pasien.'
                ], 403);
            }

            $remaining = 5 - $app->tracking_attempts;
            return response()->json([
                'success' => false,
                'message' => "{$genericError} (Sisa percobaan: {$remaining}x)"
            ], 401);
        }

        // 3. Berhasil: Reset percobaan
        RateLimiter::clear($throttleKey);
        $app->update(['tracking_attempts' => 0]);

        return response()->json([
            'success' => true,
            'application' => [
                'application_number' => $app->application_number,
                'status' => $app->status->value,
                'status_label' => $app->status->label(),
                'patient_name' => $app->patient->full_name,
                'masked_nik' => $app->patient->masked_nik,
                'destination_hospital' => $app->destination_hospital,
                'appointment_date' => $app->appointment_date->format('Y-m-d'),
                'planned_check_in_date' => $app->planned_check_in_date->format('Y-m-d'),
                'estimated_stay_days' => $app->estimated_stay_days,
                'documents' => $app->documents->map(fn($d) => [
                    'doc_name' => $d->doc_name,
                    'status' => $d->status,
                    'review_notes' => $d->review_notes,
                ]),
                'letter' => $app->approvalLetter ? [
                    'letter_number' => $app->approvalLetter->letter_number,
                    'letter_date' => $app->approvalLetter->letter_date->format('Y-m-d'),
                    'signer_name' => $app->approvalLetter->signer_name,
                    'verification_token' => $app->approvalLetter->verification_token,
                    'status' => $app->approvalLetter->status,
                ] : null,
                'room_assignment' => $app->roomAssignment ? [
                    'room_number' => $app->roomAssignment->room->room_number,
                    'room_name' => $app->roomAssignment->room->room_name,
                    'bed_number' => $app->roomAssignment->bed->bed_number,
                    'check_in_date' => $app->roomAssignment->check_in_date->format('Y-m-d'),
                    'check_out_date' => $app->roomAssignment->check_out_date->format('Y-m-d'),
                    'status' => $app->roomAssignment->status,
                ] : null,
            ]
        ]);
    }
}
