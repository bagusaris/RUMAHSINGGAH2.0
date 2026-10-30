<?php

use App\Http\Controllers\AdminVerificationController;
use App\Http\Controllers\DirectorApprovalController;
use App\Http\Controllers\PublicRegistrationController;
use App\Http\Controllers\PublicTrackingController;
use App\Http\Controllers\ShelterPlacementController;
use App\Http\Controllers\StaffAuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SIM-RSP Dinas Kesehatan API Routes (Laravel 11 / PHP 8.5)
|--------------------------------------------------------------------------
*/

// ========================
// 1. PUBLIC ROUTES (No login required)
// ========================
Route::prefix('v1/public')->group(function () {
    // Requirements catalog
    Route::get('/requirements', [PublicRegistrationController::class, 'getRequirements']);
    
    // 5-step registration endpoint
    Route::post('/register', [PublicRegistrationController::class, 'register']);
    
    // Tri-factor status tracking (Throttled & Brute-force lockout protected)
    Route::post('/tracking', [PublicTrackingController::class, 'track']);
    
    // QR Code / Token public verification
    Route::get('/verify-document', [PublicTrackingController::class, 'verifyDocumentToken']);
});

// ========================
// 2. AUTHENTICATION ROUTES
// ========================
Route::prefix('v1/auth')->group(function () {
    Route::post('/login', [StaffAuthController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [StaffAuthController::class, 'profile']);
        Route::post('/logout', [StaffAuthController::class, 'logout']);
    });
});

// ========================
// 3. STAFF PROTECTED ROUTES
// ========================
Route::prefix('v1/staff')->middleware(['auth:sanctum'])->group(function () {
    
    // Admin Verification (Admin Dinkes, Super Admin)
    Route::prefix('applications')->group(function () {
        Route::get('/', [AdminVerificationController::class, 'index']);
        Route::get('/{id}', [AdminVerificationController::class, 'show']);
        Route::put('/documents/{documentId}', [AdminVerificationController::class, 'reviewDocument']);
        Route::post('/{id}/finalize-verification', [AdminVerificationController::class, 'finalizeVerification']);
        
        // Director Approval & Electronic Signature (Kadinkes, Super Admin)
        Route::post('/{id}/decide', [DirectorApprovalController::class, 'decide']);
    });

    // Shelter Placement & Management (Petugas RSP, Super Admin)
    Route::prefix('shelter')->group(function () {
        Route::get('/matrix', [ShelterPlacementController::class, 'getRoomMatrix']);
        Route::post('/applications/{id}/assign-bed', [ShelterPlacementController::class, 'assignBed']);
        Route::post('/assignments/{id}/check-in', [ShelterPlacementController::class, 'checkIn']);
        Route::post('/assignments/{id}/check-out', [ShelterPlacementController::class, 'checkOut']);
    });

    // Super Admin System Management
    Route::prefix('admin')->group(function () {
        Route::post('/users', [StaffAuthController::class, 'createUser']);
    });
});
