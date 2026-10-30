<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalLetter extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'approval_letters';

    protected $fillable = [
        'application_id',
        'letter_number',
        'signed_by_name',
        'signed_by_nip',
        'signed_by_position',
        'signer_certificate_id',
        'bsre_request_id',
        'bsre_signature_token',
        'document_sha256',
        'signature_status',
        'signed_at',
        'verification_qr_token',
        'pdf_file_path',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
