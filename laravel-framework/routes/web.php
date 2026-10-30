<?php

use App\Models\ApprovalLetter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

/*
|--------------------------------------------------------------------------
| Web Routes (Laravel 11 / PHP 8.5)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome', [
        'app_name' => 'SIM-RSP Dinas Kesehatan',
        'version' => '1.0.0 (PHP 8.5)',
    ]);
});

// Public verification web landing page
Route::get('/verifikasi', function () {
    $token = request()->query('token');
    $letter = $token ? ApprovalLetter::with(['application.patient', 'application.roomAssignment.room'])->where('verification_qr_token', $token)->first() : null;

    return view('verification_result', [
        'token' => $token,
        'letter' => $letter,
        'isValid' => !is_null($letter),
    ]);
});

// Secure PDF Letter Download with signed URL or session check
Route::get('/letters/{applicationNumber}.pdf', function (string $applicationNumber) {
    $path = "approval_letters/{$applicationNumber}.pdf";

    if (!Storage::disk('private')->exists($path)) {
        abort(404, 'Dokumen persetujuan tidak ditemukan atau belum ditandatangani.');
    }

    return response()->file(Storage::disk('private')->path($path), [
        'Content-Type' => 'application/pdf',
        'Content-Disposition' => 'inline; filename="SK_Rumah_Singgah_' . $applicationNumber . '.pdf"',
    ]);
})->name('letter.download');
