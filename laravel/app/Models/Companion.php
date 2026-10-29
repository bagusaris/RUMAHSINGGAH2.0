<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Companion extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'companions';

    protected $fillable = [
        'application_id',
        'nik',
        'full_name',
        'relationship',
        'phone_number',
        'id_card_file_path',
        'notes',
    ];

    /**
     * UU PDP Compliance: Mask NIK for public display/audit
     */
    public function getMaskedNikAttribute(): string
    {
        if (strlen($this->nik) === 16) {
            return substr($this->nik, 0, 6) . '******' . substr($this->nik, 12, 4);
        }
        return '******';
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
