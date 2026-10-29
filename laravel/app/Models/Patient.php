<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    use HasUuids;

    protected $fillable = [
        'nik',
        'full_name',
        'birth_place',
        'birth_date',
        'gender',
        'address',
        'phone',
        'emergency_phone',
        'bpjs_number',
        'diagnosa',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function companion(): HasOne
    {
        return $this->hasOne(Companion::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    // Helper penyamaran NIK untuk tampilan publik (UU PDP)
    public function getMaskedNikAttribute(): string
    {
        if (strlen($this->nik) < 16) return $this->nik;
        return substr($this->nik, 0, 6) . '******' . substr($this->nik, 12);
    }
}
