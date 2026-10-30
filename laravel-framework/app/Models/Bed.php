<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bed extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'beds';

    protected $fillable = [
        'room_id',
        'bed_code',
        'is_operational',
        'notes',
    ];

    protected $casts = [
        'is_operational' => 'boolean',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(RoomAssignment::class);
    }

    /**
     * Check if bed is booked or occupied for a specific date range
     */
    public function isAvailableBetween(string $startDate, string $endDate, ?string $excludeAssignmentId = null): bool
    {
        $query = $this->assignments()
            ->whereIn('status', ['assigned', 'checked_in'])
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where('check_in_date', '<=', $endDate)
                  ->where('check_out_date', '>=', $startDate);
            });

        if ($excludeAssignmentId) {
            $query->where('id', '!=', $excludeAssignmentId);
        }

        return !$query->exists();
    }
}
