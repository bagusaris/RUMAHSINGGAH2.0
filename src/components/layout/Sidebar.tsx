import React from 'react';
import {
  FileText,
  CheckCircle,
  Building,
  Bed,
  Users,
  Settings,
  ShieldCheck,
  FileCheck2,
  Clock,
  LogOut,
  Sliders,
  Inbox,
  PenTool,
  Home
} from 'lucide-react';
import { useAuth } from '../../services/auth/authContext.tsx';
import { storage } from '../../services/storage.ts';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentRole, currentUser, logout } = useAuth();
  const applications = storage.getApplications();

  // Metric badges for sidebar
  const pendingReviewCount = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review').length;
  const pendingDirectorCount = applications.filter((a) => a.status === 'pending_decision').length;
  const awaitingPlacementCount = applications.filter((a) => a.status === 'approved' && (!a.roomAssignment || a.roomAssignment.status === 'awaiting_placement')).length;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      
      {/* Current Staff Profile Summary */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base shadow-inner">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-white text-sm truncate">{currentUser.name}</h4>
            <p className="text-[11px] text-blue-400 font-medium truncate">{currentUser.position || 'Staf Teknis'}</p>
            {currentUser.nip && (
              <p className="text-[10px] text-slate-400 font-mono">NIP. {currentUser.nip}</p>
            )}
          </div>
        </div>
      </div>

      {/* Role Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 text-xs font-medium overflow-y-auto">

        {/* --- MENU HEALTH ADMIN --- */}
        {currentRole === 'health_admin' && (
          <>
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verifikasi & Administrasi
            </div>

            <button
              onClick={() => setActiveTab('admin_dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'admin_dashboard'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Semua Permohonan</span>
              </div>
              {pendingReviewCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('admin_verified_queue')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'admin_verified_queue'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Daftar Terverifikasi</span>
            </button>
          </>
        )}

        {/* --- MENU DIRECTOR --- */}
        {currentRole === 'director' && (
          <>
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-400">
              Otoritas Persetujuan & TTE
            </div>

            <button
              onClick={() => setActiveTab('director_dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'director_dashboard'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-500/20'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4" />
                <span>Menunggu Keputusan</span>
              </div>
              {pendingDirectorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-400 text-slate-950">
                  {pendingDirectorCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('director_signed_letters')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'director_signed_letters'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Monitoring TTE (BSrE)</span>
            </button>
          </>
        )}

        {/* --- MENU SHELTER ADMIN --- */}
        {currentRole === 'shelter_admin' && (
          <>
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Operasional Rumah Singgah
            </div>

            <button
              onClick={() => setActiveTab('shelter_dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'shelter_dashboard'
                  ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bed className="w-4 h-4" />
                <span>Antrean Alokasi Kamar</span>
              </div>
              {awaitingPlacementCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950">
                  {awaitingPlacementCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('shelter_rooms')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'shelter_rooms'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Manajemen Gedung & Bed</span>
            </button>

            <button
              onClick={() => setActiveTab('shelter_occupancy')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'shelter_occupancy'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Daftar Tamu Menginap</span>
            </button>
          </>
        )}

        {/* --- MENU SUPER ADMIN --- */}
        {currentRole === 'super_admin' && (
          <>
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-rose-400">
              Administrasi Sistem
            </div>

            <button
              onClick={() => setActiveTab('superadmin_dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'superadmin_dashboard'
                  ? 'bg-rose-600 text-white font-bold shadow-md shadow-rose-500/20'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Konfigurasi & Pengaturan</span>
            </button>

            <button
              onClick={() => setActiveTab('superadmin_users')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'superadmin_users'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Kelola Akun & Hak Akses</span>
            </button>

            <button
              onClick={() => setActiveTab('superadmin_doc_reqs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'superadmin_doc_reqs'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Syarat Berkas Dokumen</span>
            </button>

            <button
              onClick={() => setActiveTab('superadmin_audit')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'superadmin_audit'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Audit Trail & Log Keamanan</span>
            </button>
          </>
        )}

        {/* Global Common Links */}
        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Akses Publik
          </div>
          <button
            onClick={() => setActiveTab('public_landing')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Lihat Portal Publik</span>
          </button>
        </div>

      </nav>

      {/* Logout / Switch Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Kembali ke Mode Pemohon</span>
        </button>
      </div>

    </aside>
  );
};
