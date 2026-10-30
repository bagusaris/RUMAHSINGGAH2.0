import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  User as UserIcon, 
  Bell, 
  FlaskConical, 
  ChevronDown, 
  LogOut, 
  LogIn,
  CheckCircle2,
  AlertTriangle,
  FileDown
} from 'lucide-react';
import { useAuth } from '../../services/auth/authContext.tsx';
import { storage } from '../../services/storage.ts';
import { UserRole } from '../../types/models.ts';
import { generateDeveloperGuidePdf } from '../../services/pdf/developerGuideGenerator.ts';

interface TopNavbarProps {
  onOpenTestRunner: () => void;
  onOpenLaravelCode?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenTestRunner, onOpenLaravelCode, activeTab, setActiveTab }) => {
  const { currentUser, currentRole, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const notifications = storage.getNotifications(currentRole);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleLabels: Record<UserRole, { label: string; badge: string; desc: string }> = {
    public: { label: 'Masyarakat / Pemohon', badge: 'bg-slate-100 text-slate-700 border-slate-300', desc: 'Akses publik tanpa login' },
    health_admin: { label: 'Admin Verifikator Dinkes', badge: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'Verifikasi berkas & administrasi' },
    director: { label: 'Kepala Dinas Kesehatan', badge: 'bg-purple-100 text-purple-800 border-purple-300', desc: 'Keputusan akhir & TTE resmi' },
    shelter_admin: { label: 'Pengelola Rumah Singgah', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'Alokasi kamar & check-in' },
    super_admin: { label: 'Super Administrator', badge: 'bg-rose-100 text-rose-800 border-rose-300', desc: 'Konfigurasi sistem & akun' },
  };

  const isPublic = currentRole === 'public';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Agency Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('public_landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">SIM-RSP</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Dinas Kesehatan
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistem Reservasi & Pelayanan Rumah Singgah Pasien
              </p>
            </div>
          </div>

          {/* Quick Public Navigation Tabs (visible when on public pages) */}
          {isPublic && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('public_landing')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'public_landing' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Beranda & Info
              </button>
              <button
                onClick={() => setActiveTab('public_register')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'public_register' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Pendaftaran Baru
              </button>
              <button
                onClick={() => setActiveTab('public_track')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'public_track' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                Lacak Status
              </button>
            </nav>
          )}

          {/* Right Tools & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Download Developer Handbook PDF Button */}
            {/* <button
              onClick={() => {
                const { url, fileName } = generateDeveloperGuidePdf();
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
              title="Unduh Buku Panduan & Tutorial Pengembang (PDF)"
            > */}
              {/* <FileDown className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden md:inline">Buku Panduan PDF</span>
            </button> */}

            {/* View Laravel Codebase Button */}
            {/* {onOpenLaravelCode && (
              <button
                onClick={onOpenLaravelCode}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                title="Lihat Source Code Laravel 11 / PHP 8.5"
              >
                <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">LV</span>
                <span className="hidden md:inline">Kode Laravel (PHP 8.5)</span>
              </button>
            )} */}

            {/* Automated QA Test Runner Button */}
            {/* <button
              onClick={onOpenTestRunner}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Jalankan Pengujian Otomatis QA"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Uji QA Otomatis</span>
            </button> */}

            {/* IF PUBLIC: Only show 'Login Petugas' button as explicitly requested */}
            {isPublic ? (
              <button
                onClick={() => setActiveTab('login')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-blue-100" />
                <span>Login Petugas</span>
              </button>
            ) : (
              /* IF INTERNAL STAFF LOGGED IN: Show notifications and staff profile/role switcher */
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Notifikasi Sistem"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800">
                        <span>Notifikasi Alur Kerja</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                          {unreadCount} baru
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-slate-400">Tidak ada notifikasi baru</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className="p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() => {
                                storage.markNotificationRead(n.id);
                                setShowNotifMenu(false);
                              }}
                            >
                              <div className="flex items-start gap-2">
                                {n.type === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                ) : n.type === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <p className="font-semibold text-slate-900">{n.title}</p>
                                  <p className="text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                                  <span className="text-[10px] text-slate-400 mt-1 block">
                                    {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Staff Persona / Role Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                    className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        {roleLabels[currentRole]?.label.split(' ')[0]}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Staff Persona Dropdown Menu */}
                  {showRoleMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Uji Peran Staf (RBAC)
                        </p>
                        <p className="text-slate-600 mt-0.5 text-[11px]">
                          Pilih akun untuk menguji wewenang berjenjang.
                        </p>
                      </div>

                      <div className="space-y-1">
                        {(Object.keys(roleLabels) as UserRole[])
                          .filter((r) => r !== 'public')
                          .map((r) => {
                            const isCurrent = currentRole === r;
                            return (
                              <button
                                key={r}
                                onClick={() => {
                                  switchRole(r);
                                  setShowRoleMenu(false);
                                  if (r === 'health_admin') {
                                    setActiveTab('admin_dashboard');
                                  } else if (r === 'director') {
                                    setActiveTab('director_dashboard');
                                  } else if (r === 'shelter_admin') {
                                    setActiveTab('shelter_dashboard');
                                  } else if (r === 'super_admin') {
                                    setActiveTab('superadmin_dashboard');
                                  }
                                }}
                                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                                  isCurrent
                                    ? 'bg-blue-50 border border-blue-200 text-blue-900 font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isCurrent ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                <div>
                                  <div className="font-bold flex items-center gap-1.5">
                                    {roleLabels[r].label}
                                    {isCurrent && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-600 text-white">Aktif</span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-normal">
                                    {roleLabels[r].desc}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            setShowRoleMenu(false);
                            setActiveTab('public_landing');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Keluar (Logout ke Publik)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
