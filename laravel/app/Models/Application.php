<?php

namespace App\Models;

use App\Enums\ApplicationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasUuids;

    protected $fillable = [
        'application_number',
        'patient_id',
        'destination_hospital',
        'referral_letter_number',
        'appointment_date',
        'planned_check_in_date',
        'estimated_stay_days',
        'status',
        'access_code_hash',
        'tracking_attempts',
        'last_tracking_attempt_at',
        'is_locked',
        'submitted_at',
    ];

    protected $casts = [
        'status' => ApplicationStatus::class,
        'appointment_date' => 'date',
        'planned_check_in_date' => 'date',
        'last_tracking_attempt_at' => 'datetime',
        'is_locked' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ApplicationReview::class);
    }

    public function approvalDecision(): HasOne
    {
        return $this->hasOne(ApprovalDecision::class);
    }

    public function approvalLetter(): HasOne
    {
        return $this->hasOne(ApprovalLetter::class);
    }

    public function roomAssignment(): HasOne
    {
        return $this->hasOne(RoomAssignment::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ApplicationStatusHistory::class)->orderByDesc('created_at');
    }
}
