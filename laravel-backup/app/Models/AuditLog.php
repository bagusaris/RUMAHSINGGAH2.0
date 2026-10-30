<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'audit_logs';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'action_name',
        'resource_type',
        'resource_id',
        'description',
        'details',
        'created_at',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Helper to write an audit log entry with automatic NIK/data masking
     */
    public static function logAction(
        ?string $userId,
        string $actionName,
        string $resourceType,
        ?string $resourceId,
        string $description,
        array $details = []
    ): self {
        // Deep mask sensitive data like NIK, passwords, or tokens in details
        array_walk_recursive($details, function (&$val, $key) {
            if (in_array(strtolower($key), ['nik', 'patient_nik', 'companion_nik']) && is_string($val) && strlen($val) === 16) {
                $val = substr($val, 0, 6) . '******' . substr($val, 12, 4);
            }
            if (in_array(strtolower($key), ['password', 'secret', 'access_code', 'token'])) {
                $val = '***REDACTED***';
            }
        });

        return self::create([
            'user_id' => $userId,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => substr(request()->userAgent() ?? 'System', 0, 255),
            'action_name' => $actionName,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'description' => $description,
            'details' => $details,
            'created_at' => now(),
        ]);
    }
}
