import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../services/auth/authContext.tsx';
import { storage } from '../../services/storage.ts';

interface StaffLoginPageProps {
  onSuccessLogin: (targetDashboardTab: string) => void;
  onBackToPublic: () => void;
}

export const StaffLoginPage: React.FC<StaffLoginPageProps> = ({ onSuccessLogin, onBackToPublic }) => {
  const { loginWithCredentials, allUsers, refreshUsers } = useAuth();
  const [emailOrNip, setEmailOrNip] = useState<string>('admin.dinkes@dinkes.go.id');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const currentUsers = storage.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = loginWithCredentials(emailOrNip, password);
      setLoading(false);

      if (res.success && res.user) {
        if (res.user.role === 'health_admin') {
          onSuccessLogin('admin_dashboard');
        } else if (res.user.role === 'director') {
          onSuccessLogin('director_dashboard');
        } else if (res.user.role === 'shelter_admin') {
          onSuccessLogin('shelter_dashboard');
        } else if (res.user.role === 'super_admin') {
          onSuccessLogin('superadmin_dashboard');
        } else {
          onSuccessLogin('public_landing');
        }
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleQuickLogin = (email: string) => {
    setEmailOrNip(email);
    setPassword('admin123');
    setErrorMsg('');
    const res = loginWithCredentials(email, 'admin123');
    if (res.success && res.user) {
      if (res.user.role === 'health_admin') {
        onSuccessLogin('admin_dashboard');
      } else if (res.user.role === 'director') {
        onSuccessLogin('director_dashboard');
      } else if (res.user.role === 'shelter_admin') {
        onSuccessLogin('shelter_dashboard');
      } else if (res.user.role === 'super_admin') {
        onSuccessLogin('superadmin_dashboard');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda Publik Rumah Singgah</span>
        </button>

        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Akses Internal Terbatas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Login Form Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Login Petugas & Pimpinan
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Masuk menggunakan Email Kedinasan atau NIP resmi untuk mengakses dasbor verifikasi, persetujuan TTE, dan alokasi kamar.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email Kedinasan atau NIP Pegawai <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={emailOrNip}
                  onChange={(e) => setEmailOrNip(e.target.value)}
                  placeholder="admin.dinkes@dinkes.go.id atau NIP"
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">
                  Kata Sandi (Password) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Default: admin123</span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-white text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <span>{loading ? 'Memvalidasi Kredensial...' : 'Masuk ke Sistem'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Sistem mencatat seluruh upaya login ke dalam Audit Trail dan menerapkan pembatasan hak akses berbasis peran (RBAC).
            </span>
          </div>
        </div>

        {/* Right: Quick 1-Click Demo Login Personas */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white space-y-2 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Akses Cepat Pengujian (1-Click Login)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Klik salah satu akun di bawah ini untuk langsung masuk dan menguji alur kerja peran tersebut:
            </p>
          </div>

          <div className="space-y-2 text-xs">
            {currentUsers.map((u) => {
              const roleBadgeColor =
                u.role === 'director'
                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                  : u.role === 'health_admin'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : u.role === 'shelter_admin'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200';

              const roleLabel =
                u.role === 'director'
                  ? 'Kepala Dinas'
                  : u.role === 'health_admin'
                  ? 'Admin Verifikator'
                  : u.role === 'shelter_admin'
                  ? 'Pengelola RSP'
                  : 'Super Admin';

              return (
                <div
                  key={u.id}
                  onClick={() => handleQuickLogin(u.email)}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {u.name}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                  </div>

                  <span className="text-[11px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    Masuk →
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
