import React, { useState } from 'react';
import {
  Inbox,
  Search,
  Filter,
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Building,
  RefreshCw
} from 'lucide-react';
import { storage } from '../../services/storage.ts';
import { Application, ApplicationStatus } from '../../types/models.ts';
import { APPLICATION_STATUS_CONFIG } from '../../types/workflow.ts';
import { DocumentReviewModal } from './DocumentReviewModal.tsx';

export const AdminDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>(() => storage.getApplications());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppForReview, setSelectedAppForReview] = useState<Application | null>(null);

  const refreshData = () => {
    setApplications(storage.getApplications());
  };

  // Metrics
  const total = applications.length;
  const newSubmissions = applications.filter((a) => a.status === 'submitted').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const needsRevision = applications.filter((a) => a.status === 'needs_revision').length;
  const pendingDecision = applications.filter((a) => a.status === 'pending_decision').length;
  const approved = applications.filter((a) => a.status === 'approved').length;
  const rejected = applications.filter((a) => a.status === 'rejected').length;

  // Filtered List
  const filtered = applications.filter((app) => {
    const matchSearch =
      app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.destinationHospital.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Verifikasi Administrasi Dinas Kesehatan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemeriksaan keabsahan berkas pendaftaran rujukan pasien sebelum diteruskan ke Kepala Dinas.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={statusFilter === 'all' ? 'text-blue-100' : 'text-slate-400'}>Semua Berkas</span>
          <div className="text-xl font-black mt-1">{total}</div>
        </button>

        <button
          onClick={() => setStatusFilter('submitted')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'submitted' ? 'bg-blue-700 text-white border-blue-700 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={statusFilter === 'submitted' ? 'text-blue-200' : 'text-blue-700'}>Baru Masuk</span>
          <div className="text-xl font-black mt-1">{newSubmissions}</div>
        </button>

        <button
          onClick={() => setStatusFilter('under_review')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'under_review' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={statusFilter === 'under_review' ? 'text-amber-200' : 'text-amber-700'}>Dalam Review</span>
          <div className="text-xl font-black mt-1">{underReview}</div>
        </button>

        <button
          onClick={() => setStatusFilter('needs_revision')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'needs_revision' ? 'bg-orange-600 text-white border-orange-600 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={statusFilter === 'needs_revision' ? 'text-orange-200' : 'text-orange-700'}>Perlu Revisi</span>
          <div className="text-xl font-black mt-1">{needsRevision}</div>
        </button>

        <button
          onClick={() => setStatusFilter('pending_decision')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'pending_decision' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={statusFilter === 'pending_decision' ? 'text-purple-200' : 'text-purple-700'}>Ke Meja Kadinkes</span>
          <div className="text-xl font-black mt-1">{pendingDecision}</div>
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            statusFilter === 'approved' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className={statusFilter === 'approved' ? 'text-emerald-200' : 'text-emerald-700'}>Disetujui</span>
          <div className="text-xl font-black mt-1">{approved}</div>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Registrasi, Nama Pasien, Faskes..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="all">Semua Status Permohonan</option>
            <option value="submitted">Baru Diajukan (Submitted)</option>
            <option value="under_review">Sedang Ditinjau (Under Review)</option>
            <option value="needs_revision">Perlu Revisi (Needs Revision)</option>
            <option value="pending_decision">Terverifikasi (Pending Decision)</option>
            <option value="approved">Disetujui (Approved)</option>
            <option value="rejected">Ditolak (Rejected)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">No. Permohonan</th>
                <th className="p-4">Pasien & Domisili</th>
                <th className="p-4">Faskes Rujukan</th>
                <th className="p-4">Jadwal Masuk</th>
                <th className="p-4">Dokumen</th>
                <th className="p-4">Status Alur Kerja</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Tidak ditemukan data permohonan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const docs = app.documents || [];
                  const validDocs = docs.filter((d) => d.status === 'valid').length;
                  const totalDocs = docs.length;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 block">{app.applicationNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(app.submittedAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">{app.patient?.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-500">
                          NIK: {app.patient?.nik.substring(0, 6)}******{app.patient?.nik.substring(12)}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {app.patient?.address}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-900 truncate max-w-[150px]">
                          {app.destinationHospital}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          No: {app.referralLetterNumber}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-blue-700">{app.plannedCheckInDate}</div>
                        <div className="text-[10px] text-slate-500">
                          Durasi: {app.estimatedStayDays} Hari
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            validDocs === totalDocs && totalDocs > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {validDocs}/{totalDocs} Valid
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-xl font-bold text-[10px] border ${
                            APPLICATION_STATUS_CONFIG[app.status]?.badgeColor || 'bg-slate-100'
                          }`}
                        >
                          {APPLICATION_STATUS_CONFIG[app.status]?.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForReview(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold text-xs transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Tinjau Berkas</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Review Modal */}
      {selectedAppForReview && (
        <DocumentReviewModal
          application={selectedAppForReview}
          onClose={() => setSelectedAppForReview(null)}
          onRefresh={refreshData}
        />
      )}

    </div>
  );
};
