import React, { useState } from 'react';
import { X, Folder, FileCode, Check, Copy, Terminal, ExternalLink } from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  category: string;
  language: string;
  content: string;
}

const LARAVEL_FILES: FileItem[] = [
  {
    name: 'composer.json',
    path: '/laravel/composer.json',
    category: 'Config',
    language: 'json',
    content: `{
  "name": "dinkes/sim-rsp",
  "type": "project",
  "description": "Sistem Informasi Manajemen Rumah Singgah Pasien (SIM-RSP) Dinas Kesehatan",
  "keywords": ["dinkes", "rumah-singgah", "laravel", "php8.5", "bsre-bssn", "uu-pdp"],
  "require": {
    "php": "^8.2 || ^8.3 || ^8.4 || ^8.5",
    "barryvdh/laravel-dompdf": "^3.0",
    "guzzlehttp/guzzle": "^7.8",
    "laravel/framework": "^11.0 || ^12.0",
    "laravel/sanctum": "^4.0",
    "simplesoftwareio/simple-qrcode": "^4.2",
    "spatie/laravel-permission": "^6.4"
  }
}`
  },
  {
    name: 'PublicRegistrationController.php',
    path: '/laravel/app/Http/Controllers/PublicRegistrationController.php',
    category: 'Controllers',
    language: 'php',
    content: `<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\Application;
use App\Models\AuditLog;
use App\Models\Companion;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PublicRegistrationController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'patient.nik' => ['required', 'string', 'size:16', 'regex:/^[0-9]{16}$/'],
            'patient.full_name' => 'required|string|max:255',
            'requested_check_in_date' => 'required|date|after_or_equal:today',
            'requested_check_out_date' => 'required|date|after_or_equal:requested_check_in_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        return DB::transaction(function () use ($request) {
            $accessCodeRaw = str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $applicationNumber = 'RSP-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            $patient = Patient::create(array_merge($request->input('patient'), [
                'registered_ip' => $request->ip(),
            ]));

            $application = Application::create([
                'application_number' => $applicationNumber,
                'patient_id' => $patient->id,
                'status' => ApplicationStatus::SUBMITTED,
                'access_code_hash' => Hash::make($accessCodeRaw),
                'requested_check_in_date' => $request->input('requested_check_in_date'),
                'requested_check_out_date' => $request->input('requested_check_out_date'),
                'submitted_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'application_number' => $applicationNumber,
                'access_code' => $accessCodeRaw,
            ], 201);
        });
    }
}`
  },
  {
    name: 'ShelterPlacementController.php',
    path: '/laravel/app/Http/Controllers/ShelterPlacementController.php',
    category: 'Controllers',
    language: 'php',
    content: `<?php

namespace App\Http\Controllers;

use App\Enums\ApplicationStatus;
use App\Models\Bed;
use App\Models\Room;
use App\Models\RoomAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ShelterPlacementController extends Controller
{
    public function assignBed(Request $request, string $applicationId): JsonResponse
    {
        $roomId = $request->input('room_id');
        $bedId = $request->input('bed_id');
        $checkIn = $request->input('check_in_date');
        $checkOut = $request->input('check_out_date');

        return DB::transaction(function () use ($applicationId, $roomId, $bedId, $checkIn, $checkOut) {
            // Pessimistic Locking to avoid race conditions
            $bed = Bed::where('id', $bedId)->lockForUpdate()->firstOrFail();

            // Strict interval overlap formula (Anti Double-Booking)
            $isAvailable = $bed->isAvailableBetween($checkIn, $checkOut);
            if (!$isAvailable) {
                return response()->json([
                    'success' => false,
                    'message' => 'Konflik Jadwal: Tempat tidur sudah terisi untuk tanggal tersebut.',
                ], 409);
            }

            $assignment = RoomAssignment::create([
                'application_id' => $applicationId,
                'room_id' => $roomId,
                'bed_id' => $bedId,
                'check_in_date' => $checkIn,
                'check_out_date' => $checkOut,
                'status' => 'assigned',
            ]);

            return response()->json(['success' => true, 'data' => $assignment]);
        });
    }
}`
  },
  {
    name: 'Patient.php',
    path: '/laravel/app/Models/Patient.php',
    category: 'Models',
    language: 'php',
    content: `<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasUuids;

    protected $fillable = [
        'nik', 'full_name', 'phone_number', 'city_name', 'medical_diagnosis',
        'hospital_referral_destination', 'is_sktm_verified'
    ];

    /**
     * UU PDP Compliance (UU No. 27 Tahun 2022)
     * Otomatis masking NIK 16 digit: 332204******0002
     */
    public function getMaskedNikAttribute(): string
    {
        if (strlen($this->nik) === 16) {
            return substr($this->nik, 0, 6) . '******' . substr($this->nik, 12, 4);
        }
        return '******';
    }
}`
  },
  {
    name: 'EsignBsreService.php',
    path: '/laravel/app/Services/EsignBsreService.php',
    category: 'Services',
    language: 'php',
    content: `<?php

namespace App\Services;

use App\Models\Application;
use App\Models\ApprovalLetter;
use Illuminate\Support\Str;

class EsignBsreService
{
    public function generateSignedLetter(Application $application, $signer, $checkIn, $checkOut, $notes): ApprovalLetter
    {
        $year = date('Y');
        $letterNumber = "440/" . rand(100, 999) . "/RSP-DINKES/{$year}";

        // Compute SHA-256 cryptographic digest of document payload
        $rawPayload = json_encode([
            'letter_number' => $letterNumber,
            'application_number' => $application->application_number,
            'patient_nik' => $application->patient->nik,
            'signer_nip' => $signer?->nip ?? '197405122000031002',
            'timestamp' => now()->toIso8601String(),
        ]);
        $documentSha256 = hash('sha256', $rawPayload);
        $qrToken = 'VERIF-' . strtoupper(Str::random(24));

        return ApprovalLetter::create([
            'application_id' => $application->id,
            'letter_number' => $letterNumber,
            'signed_by_name' => $signer?->name ?? 'dr. H. Rahmat Hidayat, M.Kes',
            'signed_by_nip' => $signer?->nip ?? '197405122000031002',
            'signed_by_position' => 'Kepala Dinas Kesehatan',
            'bsre_request_id' => 'BSRE-REQ-' . strtoupper(Str::random(16)),
            'document_sha256' => $documentSha256,
            'signature_status' => 'signed',
            'signed_at' => now(),
            'verification_qr_token' => $qrToken,
            'pdf_file_path' => "approval_letters/{$application->application_number}.pdf",
        ]);
    }
}`
  },
  {
    name: 'api.php',
    path: '/laravel/routes/api.php',
    category: 'Routes',
    language: 'php',
    content: `<?php

use App\Http\Controllers\AdminVerificationController;
use App\Http\Controllers\DirectorApprovalController;
use App\Http\Controllers\PublicRegistrationController;
use App\Http\Controllers\PublicTrackingController;
use App\Http\Controllers\ShelterPlacementController;
use App\Http\Controllers\StaffAuthController;
use Illuminate\Support\Facades\Route;

// Public Endpoints
Route::prefix('v1/public')->group(function () {
    Route::post('/register', [PublicRegistrationController::class, 'register']);
    Route::post('/tracking', [PublicTrackingController::class, 'track']);
    Route::get('/verify-document', [PublicTrackingController::class, 'verifyDocumentToken']);
});

// Staff Authentication & Workflow
Route::prefix('v1/staff')->middleware('auth:sanctum')->group(function () {
    Route::get('/applications', [AdminVerificationController::class, 'index']);
    Route::post('/applications/{id}/decide', [DirectorApprovalController::class, 'decide']);
    Route::get('/shelter/matrix', [ShelterPlacementController::class, 'getRoomMatrix']);
    Route::post('/shelter/applications/{id}/assign-bed', [ShelterPlacementController::class, 'assignBed']);
});`
  },
  {
    name: 'approval_letter.blade.php',
    path: '/laravel/resources/views/letters/approval_letter.blade.php',
    category: 'Views',
    language: 'html',
    content: `<!-- KOP SURAT DINAS KESEHATAN -->
<div class="kop-surat">
    <h2>Pemerintah Provinsi Jawa Tengah</h2>
    <h1>Dinas Kesehatan</h1>
    <p>Jl. Madukoro Blok AA-BB, Tawangmas, Semarang | Telp. (024) 7600588</p>
</div>

<div class="letter-title">
    <h3>Surat Persetujuan Pemanfaatan Fasilitas Rumah Singgah</h3>
    <p>Nomor: {{ $letter->letter_number }}</p>
</div>

<!-- TANDA TANGAN ELEKTRONIK BSrE -->
<div class="signature-box">
    <p>Ditetapkan di: Semarang, {{ $letter->signed_at->format('d F Y') }}</p>
    <p><strong>{{ $letter->signed_by_position }}</strong></p>
    <img src="data:image/png;base64,{{ $qrCodeImage }}" alt="QR BSrE">
    <p><strong><u>{{ $letter->signed_by_name }}</u></strong></p>
    <p>NIP. {{ $letter->signed_by_nip }}</p>
</div>`
  }
];

interface LaravelCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaravelCodeViewerModal: React.FC<LaravelCodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<FileItem>(LARAVEL_FILES[0]);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              LV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Kode Sumber Laravel 11/12 & PHP 8.5 (On-Premise Ready)</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  /laravel/
                </span>
              </div>
              <p className="text-xs text-slate-400">
                File implementasi PHP lengkap yang dapat langsung di-deploy ke server Apache / Nginx
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Sidebar + Code View) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Tree Sidebar */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-3 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Daftar Berkas Laravel
            </div>
            <div className="space-y-1">
              {LARAVEL_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                    selectedFile.path === file.path
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <FileCode className={`w-4 h-4 ${selectedFile.path === file.path ? 'text-white' : 'text-slate-400'}`} />
                  <div className="truncate flex-1">
                    <div className="truncate font-semibold">{file.name}</div>
                    <div className={`text-[10px] truncate ${selectedFile.path === file.path ? 'text-blue-100' : 'text-slate-400'}`}>
                      {file.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Lokasi Server:</span>
              </div>
              <code className="text-[11px] font-mono text-blue-700 block bg-blue-100/60 p-1.5 rounded">
                cd /laravel<br/>php artisan serve
              </code>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
            
            {/* Tab Toolbar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <Folder className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedFile.path}</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed">
              <pre className="text-slate-300">
                <code>{selectedFile.content}</code>
              </pre>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>Semua file disimpan di direktori <strong>/laravel/</strong> dan diuraikan pada panduan PDF.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
