<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalDecision extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'approval_decisions';

    protected $fillable = [
        'application_id',
        'director_user_id',
        'decision',
        'consideration_notes',
        'approved_check_in_date',
        'approved_check_out_date',
        'decided_at',
    ];

    protected $casts = [
        'approved_check_in_date' => 'date',
        'approved_check_out_date' => 'date',
        'decided_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function director(): BelongsTo
    {
        return $this->belongsTo(User::class, 'director_user_id');
    }
}
