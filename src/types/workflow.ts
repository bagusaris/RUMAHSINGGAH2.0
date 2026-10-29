import { ApplicationStatus, DocumentStatus, PlacementStatus, SignatureStatus, UserRole } from './models';

// State transition rules for Applications
export const ALLOWED_APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted: ['under_review', 'cancelled'],
  under_review: ['needs_revision', 'verified', 'rejected'],
  needs_revision: ['under_review', 'cancelled'],
  verified: ['pending_decision'],
  pending_decision: ['approved', 'rejected', 'needs_revision'],
  approved: ['cancelled'], // once approved, stays approved unless revoked
  rejected: [],
  cancelled: [],
};

// Role permissions matrix
export interface RolePermission {
  canSubmitApplication: boolean;
  canTrackApplication: boolean;
  canReviewDocuments: boolean;
  canVerifyApplication: boolean;
  canRejectAdmin: boolean;
  canApproveDirector: boolean;
  canRejectDirector: boolean;
  canRequestClarification: boolean;
  canManageRooms: boolean;
  canAssignRooms: boolean;
  canProcessCheckIn: boolean;
  canProcessCheckOut: boolean;
  canManageUsers: boolean;
  canConfigureSystem: boolean;
  canViewAuditLogs: boolean;
  canTriggerEsign: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  public: {
    canSubmitApplication: true,
    canTrackApplication: true,
    canReviewDocuments: false,
    canVerifyApplication: false,
    canRejectAdmin: false,
    canApproveDirector: false,
    canRejectDirector: false,
    canRequestClarification: false,
    canManageRooms: false,
    canAssignRooms: false,
    canProcessCheckIn: false,
    canProcessCheckOut: false,
    canManageUsers: false,
    canConfigureSystem: false,
    canViewAuditLogs: false,
    canTriggerEsign: false,
  },
  health_admin: {
    canSubmitApplication: false,
    canTrackApplication: true,
    canReviewDocuments: true,
    canVerifyApplication: true,
    canRejectAdmin: true,
    canApproveDirector: false, // Explicitly forbidden in Master Prompt!
    canRejectDirector: false,
    canRequestClarification: false,
    canManageRooms: false,
    canAssignRooms: false,
    canProcessCheckIn: false,
    canProcessCheckOut: false,
    canManageUsers: false,
    canConfigureSystem: false,
    canViewAuditLogs: true,
    canTriggerEsign: false,
  },
  director: {
    canSubmitApplication: false,
    canTrackApplication: true,
    canReviewDocuments: true,
    canVerifyApplication: false,
    canRejectAdmin: false,
    canApproveDirector: true, // Exclusive authority
    canRejectDirector: true,
    canRequestClarification: true,
    canManageRooms: false,
    canAssignRooms: false,
    canProcessCheckIn: false,
    canProcessCheckOut: false,
    canManageUsers: false,
    canConfigureSystem: false,
    canViewAuditLogs: true,
    canTriggerEsign: true,
  },
  shelter_admin: {
    canSubmitApplication: false,
    canTrackApplication: true,
    canReviewDocuments: false,
    canVerifyApplication: false,
    canRejectAdmin: false,
    canApproveDirector: false,
    canRejectDirector: false,
    canRequestClarification: false,
    canManageRooms: true,
    canAssignRooms: true, // Only after approved & signed
    canProcessCheckIn: true,
    canProcessCheckOut: true,
    canManageUsers: false,
    canConfigureSystem: false,
    canViewAuditLogs: true,
    canTriggerEsign: false,
  },
  super_admin: {
    canSubmitApplication: false,
    canTrackApplication: true,
    canReviewDocuments: false,
    canVerifyApplication: false,
    canRejectAdmin: false,
    canApproveDirector: false, // Technical admin separated from institutional decision maker!
    canRejectDirector: false,
    canRequestClarification: false,
    canManageRooms: true,
    canAssignRooms: false,
    canProcessCheckIn: false,
    canProcessCheckOut: false,
    canManageUsers: true,
    canConfigureSystem: true,
    canViewAuditLogs: true,
    canTriggerEsign: false,
  },
};

// Indonesian labels and colors for statuses
export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; description: string; badgeColor: string; bgSoft: string; borderSoft: string }
> = {
  submitted: {
    label: 'Diajukan',
    description: 'Permohonan baru masuk, menunggu verifikasi berkas oleh admin',
    badgeColor: 'text-blue-700 bg-blue-100 border-blue-300',
    bgSoft: 'bg-blue-50',
    borderSoft: 'border-blue-200',
  },
  under_review: {
    label: 'Sedang Ditinjau',
    description: 'Petugas sedang memverifikasi keabsahan berkas pendukung',
    badgeColor: 'text-amber-700 bg-amber-100 border-amber-300',
    bgSoft: 'bg-amber-50',
    borderSoft: 'border-amber-200',
  },
  needs_revision: {
    label: 'Perlu Revisi',
    description: 'Ada dokumen yang tidak lengkap atau tidak sesuai, pemohon perlu mengunggah ulang',
    badgeColor: 'text-orange-700 bg-orange-100 border-orange-300',
    bgSoft: 'bg-orange-50',
    borderSoft: 'border-orange-200',
  },
  verified: {
    label: 'Terverifikasi Admin',
    description: 'Seluruh berkas lengkap & valid, siap diteruskan ke Kepala Dinas',
    badgeColor: 'text-indigo-700 bg-indigo-100 border-indigo-300',
    bgSoft: 'bg-indigo-50',
    borderSoft: 'border-indigo-200',
  },
  pending_decision: {
    label: 'Menunggu Keputusan',
    description: 'Berkas telah dimeja Kepala Dinas untuk persetujuan akhir',
    badgeColor: 'text-purple-700 bg-purple-100 border-purple-300',
    bgSoft: 'bg-purple-50',
    borderSoft: 'border-purple-200',
  },
  approved: {
    label: 'Disetujui',
    description: 'Permohonan disetujui Kepala Dinas dan diterbitkan Surat Rekomendasi TTE',
    badgeColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
    bgSoft: 'bg-emerald-50',
    borderSoft: 'border-emerald-200',
  },
  rejected: {
    label: 'Ditolak',
    description: 'Permohonan ditolak dengan alasan resmi dari Dinas Kesehatan',
    badgeColor: 'text-rose-700 bg-rose-100 border-rose-300',
    bgSoft: 'bg-rose-50',
    borderSoft: 'border-rose-200',
  },
  cancelled: {
    label: 'Dibatalkan',
    description: 'Permohonan dibatalkan oleh pemohon atau kedaluwarsa',
    badgeColor: 'text-slate-600 bg-slate-100 border-slate-300',
    bgSoft: 'bg-slate-50',
    borderSoft: 'border-slate-200',
  },
};

export const DOCUMENT_STATUS_CONFIG: Record<
  DocumentStatus,
  { label: string; badgeColor: string }
> = {
  pending_review: {
    label: 'Menunggu Review',
    badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  valid: {
    label: 'Valid / Memenuhi Syarat',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  invalid: {
    label: 'Tidak Valid',
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  revision_requested: {
    label: 'Minta Revisi',
    badgeColor: 'text-orange-700 bg-orange-50 border-orange-200',
  },
};

export const SIGNATURE_STATUS_CONFIG: Record<
  SignatureStatus,
  { label: string; badgeColor: string }
> = {
  not_requested: {
    label: 'Belum Diajukan TTE',
    badgeColor: 'text-slate-600 bg-slate-100',
  },
  pending_signature: {
    label: 'Menunggu TTE Resmi',
    badgeColor: 'text-amber-700 bg-amber-100',
  },
  signed: {
    label: 'Tersertifikasi TTE Resmi (BSrE)',
    badgeColor: 'text-emerald-700 bg-emerald-100',
  },
  signature_failed: {
    label: 'Gagal TTE',
    badgeColor: 'text-rose-700 bg-rose-100',
  },
  cancelled: {
    label: 'Dibatalkan',
    badgeColor: 'text-slate-600 bg-slate-100',
  },
};

export const PLACEMENT_STATUS_CONFIG: Record<
  PlacementStatus,
  { label: string; badgeColor: string }
> = {
  awaiting_placement: {
    label: 'Menunggu Alokasi Kamar',
    badgeColor: 'text-amber-700 bg-amber-100',
  },
  assigned: {
    label: 'Kamar Telah Ditentukan',
    badgeColor: 'text-blue-700 bg-blue-100',
  },
  checked_in: {
    label: 'Sedang Menghuni (Check-In)',
    badgeColor: 'text-emerald-700 bg-emerald-100',
  },
  checked_out: {
    label: 'Selesai Menginap (Check-Out)',
    badgeColor: 'text-slate-700 bg-slate-100',
  },
  cancelled: {
    label: 'Batal Menginap',
    badgeColor: 'text-rose-700 bg-rose-100',
  },
};
