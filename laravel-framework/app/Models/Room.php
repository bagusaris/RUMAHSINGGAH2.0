<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'rooms';

    protected $fillable = [
        'building_id',
        'room_number',
        'room_type',
        'gender_allocation',
        'floor_number',
        'total_capacity',
        'occupied_capacity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'floor_number' => 'integer',
        'total_capacity' => 'integer',
        'occupied_capacity' => 'integer',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function beds(): HasMany
    {
        return $this->hasMany(Bed::class);
    }

    /**
     * Recalculates occupied capacity dynamically based on active placements
     */
    public function recalculateOccupancy(): void
    {
        $activeCount = RoomAssignment::where('room_id', $this->id)
            ->whereIn('status', ['assigned', 'checked_in'])
            ->count();

        $this->update(['occupied_capacity' => $activeCount]);
    }
}
