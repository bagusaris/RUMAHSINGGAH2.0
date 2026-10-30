<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Companion;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PublicRegistrationController extends Controller
{
    /**
     * Endpoint pendaftaran mandiri tanpa akun bagi masyarakat.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient.nik' => ['required', 'digits:16'],
            'patient.full_name' => ['required', 'string', 'max:255'],
            'patient.birth_place' => ['required', 'string', 'max:100'],
            'patient.birth_date' => ['required', 'date'],
            'patient.gender' => ['required', 'in:L,P'],
            'patient.address' => ['required', 'string'],
            'patient.phone' => ['required', 'string', 'min:10', 'max:20'],
            'patient.emergency_phone' => ['nullable', 'string', 'max:20'],
            'patient.bpjs_number' => ['nullable', 'string', 'max:30'],
            'patient.diagnosa' => ['nullable', 'string'],

            'companion.has_companion' => ['required', 'boolean'],
            'companion.full_name' => ['nullable', 'string', 'max:255'],
            'companion.nik' => ['nullable', 'digits:16'],
            'companion.relationship' => ['nullable', 'string'],
            'companion.phone' => ['nullable', 'string'],
            'companion.needs_accommodation' => ['nullable', 'boolean'],

            'destination_hospital' => ['required', 'string', 'max:255'],
            'referral_letter_number' => ['required', 'string', 'max:100'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'planned_check_in_date' => ['required', 'date'],
            'estimated_stay_days' => ['required', 'integer', 'min:1', 'max:7'],

            'documents' => ['required', 'array'],
            'documents.*.requirement_id' => ['required', 'string'],
            'documents.*.doc_code' => ['required', 'string'],
            'documents.*.doc_name' => ['required', 'string'],
            'documents.*.file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:3072'],
        ]);

        return DB::transaction(function () use ($request, $validated) {
            // 1. Simpan Identitas Pasien
            $patient = Patient::create($validated['patient']);

            // 2. Simpan Data Pendamping jika ada
            if ($validated['companion']['has_companion']) {
                Companion::create([
                    'patient_id' => $patient->id,
                    'has_companion' => true,
                    'full_name' => $validated['companion']['full_name'],
                    'nik' => $validated['companion']['nik'] ?? null,
                    'relationship' => $validated['companion']['relationship'] ?? 'Keluarga',
                    'phone' => $validated['companion']['phone'] ?? null,
                    'needs_accommodation' => $validated['companion']['needs_accommodation'] ?? true,
                ]);
            }

            // 3. Generate Nomor Permohonan Resmi (RSP-YYYYMM-XXXX)
            $yearMonth = date('Ym');
            $monthlyCount = Application::whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->count() + 1;
            $appNumber = "RSP-{$yearMonth}-" . str_pad((string) $monthlyCount, 4, '0', STR_PAD_LEFT);

            // 4. Generate 6 Digit Kode Akses Rahasia (Unhashed dikembalikan sekali)
            $rawAccessCode = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

            $application = Application::create([
                'application_number' => $appNumber,
                'patient_id' => $patient->id,
                'destination_hospital' => $validated['destination_hospital'],
                'referral_letter_number' => $validated['referral_letter_number'],
                'appointment_date' => $validated['appointment_date'],
                'planned_check_in_date' => $validated['planned_check_in_date'],
                'estimated_stay_days' => $validated['estimated_stay_days'],
                'status' => 'submitted',
                'access_code_hash' => Hash::make($rawAccessCode),
                'tracking_attempts' => 0,
                'is_locked' => false,
                'submitted_at' => now(),
            ]);

            // 5. Simpan Dokumen ke Storage Private (Aman & Tidak Publik)
            if ($request->hasFile('document_files')) {
                foreach ($request->file('document_files') as $idx => $file) {
                    $path = $file->store("applications/{$application->id}", 'private');
                    $application->documents()->create([
                        'requirement_id' => $request->input("documents.{$idx}.requirement_id"),
                        'doc_code' => $request->input("documents.{$idx}.doc_code"),
                        'doc_name' => $request->input("documents.{$idx}.doc_name"),
                        'file_name' => $file->getClientOriginalName(),
                        'file_path' => $path,
                        'file_size' => $file->getSize(),
                        'mime_type' => $file->getMimeType(),
                        'status' => 'pending_review',
                        'version' => 1,
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Permohonan pendaftaran Rumah Singgah Pasien berhasil dikirim.',
                'application_number' => $appNumber,
                'access_code' => $rawAccessCode,
                'patient_name' => $patient->full_name,
            ], 201);
        });
    }
}
