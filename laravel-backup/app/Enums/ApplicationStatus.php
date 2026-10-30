<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case NEEDS_REVISION = 'needs_revision';
    case VERIFIED = 'verified';
    case PENDING_DECISION = 'pending_decision';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::SUBMITTED => 'Diajukan (Menunggu Review)',
            self::UNDER_REVIEW => 'Sedang Ditinjau Admin',
            self::NEEDS_REVISION => 'Perlu Revisi Dokumen',
            self::VERIFIED => 'Terverifikasi Administratif',
            self::PENDING_DECISION => 'Menunggu Keputusan Kepala Dinas',
            self::APPROVED => 'Disetujui Resmi (TTE BSrE)',
            self::REJECTED => 'Ditolak',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public function badgeClass(): string
    {
        return match ($this) {
            self::SUBMITTED => 'bg-blue-100 text-blue-800',
            self::UNDER_REVIEW => 'bg-amber-100 text-amber-800',
            self::NEEDS_REVISION => 'bg-orange-100 text-orange-800',
            self::VERIFIED => 'bg-indigo-100 text-indigo-800',
            self::PENDING_DECISION => 'bg-purple-100 text-purple-800',
            self::APPROVED => 'bg-emerald-100 text-emerald-800',
            self::REJECTED => 'bg-rose-100 text-rose-800',
            self::CANCELLED => 'bg-slate-100 text-slate-800',
        };
    }
}
