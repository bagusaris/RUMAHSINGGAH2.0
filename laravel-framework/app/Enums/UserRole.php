<?php

namespace App\Enums;

enum UserRole: string
{
    case PUBLIC = 'public';
    case ADMIN_DINKES = 'health_admin';
    case DIRECTOR_KADINKES = 'director';
    case SHELTER_ADMIN = 'shelter_admin';
    case SUPER_ADMIN = 'super_admin';

    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Pemohon Publik',
            self::ADMIN_DINKES => 'Admin Verifikator Dinas Kesehatan',
            self::DIRECTOR_KADINKES => 'Kepala Dinas Kesehatan',
            self::SHELTER_ADMIN => 'Pengelola Rumah Singgah Pasien (RSP)',
            self::SUPER_ADMIN => 'Super Administrator Sistem',
        };
    }
}
