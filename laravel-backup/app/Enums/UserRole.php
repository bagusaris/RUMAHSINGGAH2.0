<?php

namespace App\Enums;

enum UserRole: string
{
    case PUBLIC = 'public';
    case HEALTH_ADMIN = 'health_admin';
    case DIRECTOR = 'director';
    case SHELTER_ADMIN = 'shelter_admin';
    case SUPER_ADMIN = 'super_admin';

    public function label(): string
    {
        return match ($this) {
            self::PUBLIC => 'Pemohon Publik',
            self::HEALTH_ADMIN => 'Admin Verifikator Dinas Kesehatan',
            self::DIRECTOR => 'Kepala Dinas Kesehatan',
            self::SHELTER_ADMIN => 'Pengelola Rumah Singgah Pasien (RSP)',
            self::SUPER_ADMIN => 'Super Administrator Sistem',
        };
    }
}
