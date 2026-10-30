<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentRequirement extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'document_requirements';

    protected $fillable = [
        'code',
        'name',
        'description',
        'is_mandatory',
        'max_file_size_mb',
        'allowed_mime_types',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
        'max_file_size_mb' => 'integer',
        'sort_order' => 'integer',
        'allowed_mime_types' => 'array',
    ];
}
