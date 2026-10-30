<?php

namespace App\Enums;

enum ApplicationStatus: string
{
    case SUBMITTED = 'submitted';
    case UNDER_REVIEW = 'under_review';
    case NEEDS_REVISION = 'needs_revision';
    case VERIFIED = 'verified';
    case ADMIN_VERIFIED = 'admin_verified';
    case REJECTED_ADMIN = 'rejected_admin';
    case PENDING_DECISION = 'pending_decision';
    case APPROVED = 'approved';
    case APPROVED_DIRECTOR = 'approved_director';
    case ROOM_ASSIGNED = 'room_assigned';
    case CHECKED_IN = 'checked_in';
    case COMPLETED = 'completed';
    case REJECTED = 'rejected';
    case REJECTED_DIRECTOR = 'rejected_director';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::SUBMITTED => 'Diajukan (Menunggu Review)',
            self::UNDER_REVIEW => 'Sedang Ditinjau Admin',
            self::NEEDS_REVISION => 'Perlu Revisi Dokumen',
            self::VERIFIED => 'Terverifikasi Administratif',
            self::ADMIN_VERIFIED => 'Terverifikasi Administrasi',
            self::REJECTED_ADMIN => 'Ditolak Admin',
            self::PENDING_DECISION => 'Menunggu Keputusan Kepala Dinas',
            self::APPROVED => 'Disetujui Resmi (TTE BSrE)',
            self::APPROVED_DIRECTOR => 'Disetujui Kepala Dinas',
            self::ROOM_ASSIGNED => 'Kamar Telah Dialokasikan',
            self::CHECKED_IN => 'Pasien Telah Check-In',
            self::COMPLETED => 'Masa Tinggal Selesai',
            self::REJECTED => 'Ditolak',
            self::REJECTED_DIRECTOR => 'Ditolak Kepala Dinas',
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
            self::ADMIN_VERIFIED => 'bg-indigo-100 text-indigo-800',
            self::REJECTED_ADMIN => 'bg-rose-100 text-rose-800',
            self::PENDING_DECISION => 'bg-purple-100 text-purple-800',
            self::APPROVED => 'bg-emerald-100 text-emerald-800',
            self::APPROVED_DIRECTOR => 'bg-emerald-100 text-emerald-800',
            self::ROOM_ASSIGNED => 'bg-indigo-100 text-indigo-800',
            self::CHECKED_IN => 'bg-blue-100 text-blue-800',
            self::COMPLETED => 'bg-slate-100 text-slate-800',
            self::REJECTED => 'bg-rose-100 text-rose-800',
            self::REJECTED_DIRECTOR => 'bg-rose-100 text-rose-800',
            self::CANCELLED => 'bg-slate-100 text-slate-800',
        };
    }
}
