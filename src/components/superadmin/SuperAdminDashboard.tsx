import React, { useState } from 'react';
import {
  Sliders,
  Users,
  FileText,
  ShieldCheck,
  Building,
  Key,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Lock,
  Edit2,
  X,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  FileDown
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/auth/authContext';
import { User, UserRole, DocumentRequirement, SystemSetting, AuditLog } from '../../types/models';
import { generateDeveloperGuidePdf } from '../../services/pdf/developerGuideGenerator';

export const SuperAdminDashboard: React.FC = () => {
  const { allUsers, currentUser, refreshUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'doc_reqs' | 'audit'>('users');

  const [settings, setSettings] = useState<SystemSetting[]>(() => storage.getSystemSettings());
  const [docReqs, setDocReqs] = useState<DocumentRequirement[]>(() => storage.getDocumentRequirements());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storage.getAuditLogs());
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>('');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [newUserNip, setNewUserNip] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('health_admin');
  const [newUserPosition, setNewUserPosition] = useState<string>('');
  const [newUserDepartment, setNewUserDepartment] = useState<string>('');
  const [newUserPhone, setNewUserPhone] = useState<string>('');
  const [newUserPassword, setNewUserPassword] = useState<string>('admin123');
  const [addUserError, setAddUserError] = useState<string>('');

  const refreshAll = () => {
    setSettings(storage.getSystemSettings());
    setDocReqs(storage.getDocumentRequirements());
    setAuditLogs(storage.getAuditLogs());
    refreshUsers();
  };

  const handleToggleDocMandatory = (req: DocumentRequirement) => {
    const updated = { ...req, isMandatory: !req.isMandatory };
    storage.saveDocumentRequirement(updated);
    setDocReqs(storage.getDocumentRequirements());
    setFeedbackMsg(`Syarat '${req.name}' berhasil diubah menjadi ${updated.isMandatory ? 'Wajib' : 'Opsional'}.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleUpdateSetting = (key: string, newValue: string) => {
    const target = settings.find((s) => s.key === key);
    if (target) {
      const updated = { ...target, value: newValue };
      storage.saveSystemSetting(updated);
      setSettings(storage.getSystemSettings());
      setFeedbackMsg(`Pengaturan '${target.label}' berhasil diperbarui.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    if (!newUserName.trim()) {
      setAddUserError('Nama lengkap pegawai wajib diisi.');
      return;
    }
    if (!newUserEmail.trim() || !newUserEmail.includes('@')) {
      setAddUserError('Email kedinasan tidak valid.');
      return;
    }

    const res = storage.addUser(
      {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
        nip: newUserNip.trim() || undefined,
        position: newUserPosition.trim() || undefined,
        department: newUserDepartment.trim() || undefined,
        phone: newUserPhone.trim() || undefined,
        password: newUserPassword.trim() || 'admin123',
        isActive: true,
      },
      currentUser
    );

    if (res.success) {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(''), 4000);
      setIsAddUserOpen(false);
      // Reset form
      setNewUserName('');
      setNewUserEmail('');
      setNewUserNip('');
      setNewUserPosition('');
      setNewUserDepartment('');
      setNewUserPhone('');
      setNewUserPassword('admin123');
      refreshAll();
    } else {
      setAddUserError(res.message);
    }
  };

  const handleQuickFillNewStaff = () => {
    setNewUserName('dr. Anisa Putri Rahayu, Sp.A');
    setNewUserEmail('anisa.putri@dinkes.go.id');
    setNewUserNip('19880412 201201 2 007');
    setNewUserRole('health_admin');
    setNewUserPosition('Dokter Konsultan & Verifikator Medis');
    setNewUserDepartment('Bidang Pelayanan Kesehatan (Yankes)');
    setNewUserPhone('081298761234');
    setNewUserPassword('admin123');
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Hak Akses Super Administrator</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Konfigurasi Sistem, Akun & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan parameter instansi, persyaratan berkas, penambahan akun staf, serta log audit keamanan.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              const { url, fileName } = generateDeveloperGuidePdf();
              const a = document.createElement('a');
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 shadow-2xs transition-colors cursor-pointer"
            title="Unduh Tutorial & Dokumentasi Teknis Developer (PDF)"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-600" />
            <span>Unduh Buku Panduan (PDF)</span>
          </button>

          <button
            onClick={refreshAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Muat Ulang Pengaturan</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kelola Akun Staf ({allUsers.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'settings'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Parameter Instansi & Naskah
        </button>

        <button
          onClick={() => setActiveTab('doc_reqs')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'doc_reqs'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Syarat Berkas ({docReqs.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'audit'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Trail Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT WITH ADD USER CAPABILITY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Akun Pengguna Internal</h3>
              <p className="text-[11px] text-slate-500">
                Aparatur Sipil Negara dan staf teknis yang berhak mengakses sistem sesuai matriks RBAC.
              </p>
            </div>

            <button
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Akun Staf Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Nama Pegawai & NIP</th>
                  <th className="p-3">Email Dinas</th>
                  <th className="p-3">Peran (Role RBAC)</th>
                  <th className="p-3">Jabatan & Bagian</th>
                  <th className="p-3">No. Kontak</th>
                  <th className="p-3">Status Akun</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allUsers.map((u) => {
                  const roleBadge =
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
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        {u.nip && <div className="text-[10px] font-mono text-slate-400">NIP. {u.nip}</div>}
                      </td>
                      <td className="p-3 font-mono text-slate-700">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge}`}>
                          {roleLabel} ({u.role})
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">
                        <div>{u.position || '-'}</div>
                        {u.department && <div className="text-[10px] text-slate-400">{u.department}</div>}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{u.phone || '-'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Konfigurasi Operasional & Penomoran Resmi</h3>

          <div className="space-y-4 text-xs">
            {settings.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="max-w-md">
                  <h4 className="font-bold text-slate-900">{s.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.description}</p>
                  <span className="font-mono text-[10px] text-slate-400 mt-1 block">Kunci: {s.key}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={s.value}
                    onBlur={(e) => {
                      if (e.target.value !== s.value) {
                        handleUpdateSetting(s.key, e.target.value);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-semibold text-slate-800 text-xs w-64 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT REQUIREMENTS CONFIG */}
      {activeTab === 'doc_reqs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Konfigurasi Syarat Dokumen Pendaftaran</h3>

          <div className="space-y-3 text-xs">
            {docReqs.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900">{req.name}</h4>
                    <span className="font-mono text-[10px] text-slate-400">({req.code})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{req.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Format: {req.allowedMimeTypes.join(', ')} | Max Size: {(req.maxSizeBytes / (1024 * 1024)).toFixed(0)} MB
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleDocMandatory(req)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      req.isMandatory
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {req.isMandatory ? 'Wajib Diunggah' : 'Opsional'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOG VIEWER */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jejak Audit Sistem & Keamanan Naskah</h3>
              <p className="text-[11px] text-slate-500">
                Pencatatan mutasi status permohonan, verifikasi, keputusan TTE, dan alokasi kamar (dengan penyamaran NIK).
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Cari log aksi, aktor, atau rincian..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Aktor & Peran</th>
                  <th className="p-3">Aksi</th>
                  <th className="p-3">Entitas</th>
                  <th className="p-3">Rincian Aktivitas</th>
                  <th className="p-3">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{log.actorRole}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 text-[11px]">
                      {log.action}
                    </td>
                    <td className="p-3 font-mono text-slate-600 text-[11px]">
                      {log.entityType}
                    </td>
                    <td className="p-3 text-slate-700 text-[11px] max-w-sm">
                      {log.details}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.outcome === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Tambah Akun Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-400">
                    Daftarkan akun aparatur sipil negara / staf teknis Rumah Singgah
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAddUserSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              {/* Quick Fill Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleQuickFillNewStaff}
                  className="text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                >
                  ⚡ Isi Contoh Pegawai Cepat
                </button>
              </div>

              {addUserError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addUserError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Lengkap Pegawai & Gelar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Contoh: dr. Anisa Putri Rahayu, Sp.A"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Email Kedinasan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="nama@dinkes.go.id"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      NIP (Nomor Induk Pegawai)
                    </label>
                    <input
                      type="text"
                      value={newUserNip}
                      onChange={(e) => setNewUserNip(e.target.value)}
                      placeholder="19880412 201201 2 007"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Peran Otoritas (Role RBAC) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="health_admin">Admin Verifikator Dinkes (Pemeriksaan & Verifikasi Dokumen)</option>
                    <option value="director">Kepala Dinas Kesehatan (Otoritas Persetujuan & TTE BSrE)</option>
                    <option value="shelter_admin">Pengelola Rumah Singgah (Alokasi Kamar, Bed, & Check-In)</option>
                    <option value="super_admin">Super Administrator (Manajemen Sistem, Akun, & Audit)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan Fungsional/Struktural</label>
                    <input
                      type="text"
                      value={newUserPosition}
                      onChange={(e) => setNewUserPosition(e.target.value)}
                      placeholder="Contoh: Staf Verifikator Berkas"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Satuan Kerja / Bidang</label>
                    <input
                      type="text"
                      value={newUserDepartment}
                      onChange={(e) => setNewUserDepartment(e.target.value)}
                      placeholder="Contoh: Bidang Pelayanan Kesehatan"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. Kontak / WhatsApp</label>
                    <input
                      type="tel"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kata Sandi Awal</label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="admin123"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Simpan & Aktifkan Akun</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
