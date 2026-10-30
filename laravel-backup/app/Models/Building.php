<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Building extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'buildings';

    protected $fillable = [
        'name',
        'code',
        'address',
        'total_floors',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'total_floors' => 'integer',
    ];

    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }
}
