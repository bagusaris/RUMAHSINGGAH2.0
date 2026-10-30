import React, { useState } from 'react';
import {
  FileCheck2,
  PenTool,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Download,
  Eye,
  ShieldCheck,
  Building,
  User,
  Calendar,
  RefreshCw,
  Search,
  Lock
} from 'lucide-react';
import { storage } from '../../services/storage.ts';
import { useAuth } from '../../services/auth/authContext.tsx';
import { Application } from '../../types/models.ts';
import { APPLICATION_STATUS_CONFIG, SIGNATURE_STATUS_CONFIG } from '../../types/workflow.ts';

export const DirectorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<Application[]>(() => storage.getApplications());
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'signed' | 'all'>('pending');

  const [decisionAction, setDecisionAction] = useState<'approve' | 'reject' | 'clarify' | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshData = () => {
    setApplications(storage.getApplications());
  };

  const pendingDecisionApps = applications.filter((a) => a.status === 'pending_decision');
  const signedApps = applications.filter(
    (a) => a.approvalLetter && a.approvalLetter.status === 'signed'
  );

  const displayedApps =
    activeSubTab === 'pending'
      ? pendingDecisionApps
      : activeSubTab === 'signed'
      ? signedApps
      : applications;

  // Decision Execution
  const handleExecuteDecision = async () => {
    if (!selectedApp || !decisionAction) return;

    if ((decisionAction === 'reject' || decisionAction === 'clarify') && !decisionReason.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Alasan resmi keputusan wajib diisi untuk transparansi pelayanan publik.',
      });
      return;
    }

    setIsProcessing(true);
    setFeedbackMsg(null);

    const mappedDecision =
      decisionAction === 'approve'
        ? 'approved'
        : decisionAction === 'reject'
        ? 'rejected'
        : 'clarification_requested';

    const res = await storage.decideApplicationDirector(
      selectedApp.id,
      mappedDecision,
      decisionReason,
      currentUser
    );

    setIsProcessing(false);

    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      refreshData();
      setSelectedApp(null);
      setDecisionAction(null);
      setDecisionReason('');
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-1">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Otoritas Eksklusif Kepala Dinas Kesehatan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Portal Keputusan Persetujuan & Penandatanganan Elektronik (TTE)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penetapan persetujuan layanan Rumah Singgah Pasien dengan sertifikasi digital resmi BSrE - BSSN.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Segarkan Antrean</span>
        </button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'pending'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Menunggu Persetujuan</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
            {pendingDecisionApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('signed')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === 'signed'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Dokumen Tersertifikasi TTE</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700">
            {signedApps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeSubTab === 'all'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Semua Riwayat Keputusan
        </button>
      </div>

      {/* Queue List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">No. Registrasi</th>
                <th className="p-4">Nama Pasien & NIK</th>
                <th className="p-4">Rumah Sakit Rujukan</th>
                <th className="p-4">Rencana Menginap</th>
                <th className="p-4">Status TTE / Keputusan</th>
                <th className="p-4 text-right">Aksi Pimpinan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada berkas permohonan dalam antrean ini.
                  </td>
                </tr>
              ) : (
                displayedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-slate-900 block">{app.applicationNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        Masuk: {new Date(app.submittedAt).toLocaleDateString('id-ID')}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900">{app.patient?.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-500">
                        NIK: {app.patient?.nik.substring(0, 6)}******{app.patient?.nik.substring(12)}
                      </div>
                      <div className="text-[10px] text-purple-700 font-medium">
                        Diagnosa: {app.patient?.diagnosa || 'Pemeriksaan rujukan spesialis'}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-900 truncate max-w-[160px]">
                        {app.destinationHospital}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Kontrol: {app.appointmentDate}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-blue-700">{app.plannedCheckInDate}</div>
                      <div className="text-[10px] text-slate-500">
                        Durasi: {app.estimatedStayDays} Hari ({app.companion?.hasCompanion ? '+1 Pendamping' : 'Pasien Sendiri'})
                      </div>
                    </td>

                    <td className="p-4">
                      {app.approvalLetter ? (
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-900 block truncate max-w-[150px]">
                            {app.approvalLetter.letterNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              SIGNATURE_STATUS_CONFIG[app.approvalLetter.status]?.badgeColor
                            }`}
                          >
                            {SIGNATURE_STATUS_CONFIG[app.approvalLetter.status]?.label}
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-xl font-bold text-[10px] border ${
                            APPLICATION_STATUS_CONFIG[app.status]?.badgeColor || 'bg-slate-100'
                          }`}
                        >
                          {APPLICATION_STATUS_CONFIG[app.status]?.label}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 hover:bg-purple-600 hover:text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Telaah & Putuskan</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Review Dossier Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                  <PenTool className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Telaah Permohonan & Keputusan Kepala Dinas</h3>
                  <p className="text-[11px] text-purple-200">
                    {selectedApp.applicationNumber} — Pasien: {selectedApp.patient?.fullName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedApp(null);
                  setDecisionAction(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Patient dossier info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Nama Pasien</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedApp.patient?.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">NIK Pasien</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedApp.patient?.nik.substring(0, 6)}******{selectedApp.patient?.nik.substring(12)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">RS Rujukan</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedApp.destinationHospital}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">No. Rujukan RS</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedApp.referralLetterNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Rencana Check-In</span>
                  <p className="font-bold text-blue-700 mt-0.5">
                    {selectedApp.plannedCheckInDate} ({selectedApp.estimatedStayDays} Hari)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Pendamping</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedApp.companion?.hasCompanion
                      ? `${selectedApp.companion.fullName} (${selectedApp.companion.relationship})`
                      : 'Tanpa Pendamping'}
                  </p>
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">
                  Hasil Verifikasi Dokumen oleh Staf Dinas Kesehatan:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedApp.documents?.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{doc.docName}</div>
                        <div className="text-[10px] text-slate-400">{doc.fileName}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {doc.status === 'valid' ? '✓ Valid' : doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Letter Preview (if already signed) */}
              {selectedApp.approvalLetter && (
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-purple-950 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Surat Persetujuan Resmi Telah Diterbitkan (TTE BSrE)</span>
                    </div>
                    {selectedApp.approvalLetter.pdfBlobUrl && (
                      <a
                        href={selectedApp.approvalLetter.pdfBlobUrl}
                        download={`Surat_Persetujuan_${selectedApp.applicationNumber}.pdf`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </a>
                    )}
                  </div>
                  <div className="text-[11px] text-purple-900 font-mono">
                    Nomor Surat : {selectedApp.approvalLetter.letterNumber} <br />
                    TTE Digest  : {selectedApp.approvalLetter.documentHash.substring(0, 40)}... <br />
                    Token QR    : {selectedApp.approvalLetter.verificationToken}
                  </div>
                </div>
              )}

              {/* Action Selector */}
              {selectedApp.status === 'pending_decision' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-900 text-sm block">Pilih Keputusan Pimpinan:</span>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setDecisionAction('approve')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        decisionAction === 'approve'
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200 shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500 group-hover:text-white" />
                      <span>Setujui & TTE</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionAction('clarify')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        decisionAction === 'clarify'
                          ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200 shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50'
                      }`}
                    >
                      <HelpCircle className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                      <span>Minta Klarifikasi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDecisionAction('reject')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        decisionAction === 'reject'
                          ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-200 shadow-sm font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mx-auto mb-1 text-rose-500" />
                      <span>Tolak Permohonan</span>
                    </button>
                  </div>

                  {decisionAction && (
                    <div className="space-y-1.5 animate-in fade-in">
                      <label className="block font-bold text-slate-800">
                        {decisionAction === 'approve'
                          ? 'Catatan Persetujuan (Opsional):'
                          : 'Alasan Keputusan Resmi (Wajib Transparan):'}
                      </label>
                      <textarea
                        rows={2}
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder={
                          decisionAction === 'approve'
                            ? 'Memenuhi syarat rujukan medik dan kriteria penerima manfaat Rumah Singgah Pasien.'
                            : 'Tuliskan alasan penolakan atau poin klarifikasi secara jelas...'
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  setDecisionAction(null);
                }}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>

              {selectedApp.status === 'pending_decision' && decisionAction && (
                <button
                  type="button"
                  onClick={handleExecuteDecision}
                  disabled={isProcessing}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all ${
                    decisionAction === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                      : decisionAction === 'clarify'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>
                    {isProcessing
                      ? 'Menghubungkan Gateway TTE BSrE...'
                      : decisionAction === 'approve'
                      ? 'Tanda Tangani & Terbitkan Surat'
                      : 'Simpan Keputusan'}
                  </span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
