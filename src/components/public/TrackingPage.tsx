import React, { useState } from 'react';
import {
  Search,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Building,
  Bed,
  FileText,
  FileCheck2,
  PenTool,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Application } from '../../types/models';
import { APPLICATION_STATUS_CONFIG, DOCUMENT_STATUS_CONFIG, SIGNATURE_STATUS_CONFIG } from '../../types/workflow';

interface TrackingPageProps {
  onBackToHome: () => void;
  onOpenVerificationToken?: (token: string) => void;
}

export const TrackingPage: React.FC<TrackingPageProps> = ({ onBackToHome, onOpenVerificationToken }) => {
  const [appNumber, setAppNumber] = useState<string>('RSP-202610-0001');
  const [nikLast4, setNikLast4] = useState<string>('0002');
  const [accessCode, setAccessCode] = useState<string>('782914');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [trackedApp, setTrackedApp] = useState<Application | null>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const res = storage.trackApplicationSecurely(appNumber, nikLast4, accessCode);
      setLoading(false);

      if (res.success && res.app) {
        setTrackedApp(res.app as Application);
      } else {
        setErrorMsg(res.message);
        if (res.isLocked) {
          setIsLocked(true);
        }
      }
    }, 400);
  };

  const handleQuickFillSample = (appNo: string, last4: string, code: string) => {
    setAppNumber(appNo);
    setNikLast4(last4);
    setAccessCode(code);
    setErrorMsg('');
    setIsLocked(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
          Lacak Mandiri
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Lacak Status Permohonan Rumah Singgah
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Pantau proses verifikasi berkas, penerbitan surat persetujuan Kepala Dinas, dan alokasi kamar pasien secara real-time.
        </p>
      </div>

      {/* Verification Query Card */}
      {!trackedApp && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          <form onSubmit={handleTrack} className="space-y-4">
            
            {/* Quick Fill Helpers for evaluators */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Coba Contoh Data Registrasi:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFillSample('RSP-202610-0001', '0002', '782914')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  🟢 RSP-202610-0001 (Disetujui & Ada Kamar)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillSample('RSP-202610-0002', '0004', '319482')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  🟣 RSP-202610-0002 (Menunggu Kadinkes)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFillSample('RSP-202610-0003', '0001', '528194')}
                  className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  🟠 RSP-202610-0003 (Perlu Revisi Dokumen)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Permohonan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={appNumber}
                  onChange={(e) => setAppNumber(e.target.value)}
                  placeholder="RSP-202610-xxxx"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4 Digit Terakhir NIK <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={nikLast4}
                  onChange={(e) => setNikLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 0002"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono text-center tracking-widest focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kode Akses Rahasia <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 Digit"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono text-center tracking-widest focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isLocked}
              className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                loading || isLocked
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Memeriksa Keaslian Kredensial...' : 'Periksa Status Permohonan'}</span>
            </button>
          </form>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Kombinasi 3 lapis kredensial melindungi data kesehatan pasien dari akses pihak tidak berwenang.</span>
          </div>
        </div>
      )}

      {/* Tracked Results View */}
      {trackedApp && (
        <div className="space-y-6">
          
          {/* Top Status Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Nomor Registrasi
                </span>
                <h3 className="text-xl font-black font-mono text-slate-900">{trackedApp.applicationNumber}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diajukan pada: {new Date(trackedApp.submittedAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    APPLICATION_STATUS_CONFIG[trackedApp.status]?.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {APPLICATION_STATUS_CONFIG[trackedApp.status]?.label}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {APPLICATION_STATUS_CONFIG[trackedApp.status]?.description}
            </p>

            {/* Quick Patient & Hospital Detail */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Nama Pasien</span>
                <p className="font-bold text-slate-900 mt-0.5">{trackedApp.patient?.fullName}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">NIK Pasien</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {trackedApp.patient?.nik.substring(0, 6)}******{trackedApp.patient?.nik.substring(12)}
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">RS Rujukan</span>
                <p className="font-bold text-slate-900 mt-0.5 truncate">{trackedApp.destinationHospital}</p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Rencana Check-In</span>
                <p className="font-bold text-blue-700 mt-0.5">{trackedApp.plannedCheckInDate}</p>
              </div>
            </div>
          </div>

          {/* Workflow Stage Progress Tracker */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
            <h4 className="text-sm font-bold text-slate-900">Tahapan Proses Pelayanan</h4>

            <div className="space-y-4">
              {[
                {
                  title: '1. Pengajuan Berkas Online',
                  desc: 'Formulir dan berkas berhasil diterima oleh sistem',
                  done: true,
                },
                {
                  title: '2. Verifikasi Dokumen oleh Admin Dinas',
                  desc: 'Pengecekan KTP, KK, Surat Rujukan, dan Jadwal Kontrol Medis',
                  done: ['verified', 'pending_decision', 'approved'].includes(trackedApp.status),
                  active: ['submitted', 'under_review', 'needs_revision'].includes(trackedApp.status),
                },
                {
                  title: '3. Persetujuan Kepala Dinas & TTE Resmi',
                  desc: 'Penandatanganan elektronik surat rekomendasi menggunakan sertifikat BSrE BSSN',
                  done: trackedApp.status === 'approved',
                  active: trackedApp.status === 'pending_decision',
                },
                {
                  title: '4. Penentuan Kamar & Tempat Tidur',
                  desc: 'Alokasi fasilitas dan persiapan serah terima kunci kamar oleh Pengelola RSP',
                  done: !!trackedApp.roomAssignment && ['assigned', 'checked_in', 'checked_out'].includes(trackedApp.roomAssignment.status),
                  active: trackedApp.status === 'approved' && (!trackedApp.roomAssignment || trackedApp.roomAssignment.status === 'awaiting_placement'),
                },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      step.done
                        ? 'bg-emerald-500 text-white'
                        : step.active
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${step.done || step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Penempatan Kamar (Jika Sudah Disetujui & Dialokasikan) */}
          {trackedApp.roomAssignment && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border-2 border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Bed className="w-4 h-4 text-emerald-600" />
                <span>Informasi Alokasi Kamar & Tempat Tidur</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Gedung / Lokasi</span>
                  <p className="font-bold text-slate-900 mt-0.5">{trackedApp.roomAssignment.buildingName}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Nama Kamar & No</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {trackedApp.roomAssignment.roomName} ({trackedApp.roomAssignment.roomNumber})
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Tempat Tidur (Bed)</span>
                  <p className="font-black text-emerald-700 mt-0.5">{trackedApp.roomAssignment.bedNumber}</p>
                </div>
              </div>

              <div className="text-[11px] text-emerald-900 bg-white/70 p-3 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                <span>
                  Periode Menginap: <strong>{trackedApp.roomAssignment.checkInDate}</strong> s.d{' '}
                  <strong>{trackedApp.roomAssignment.checkOutDate}</strong>
                </span>
                <span className="font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px]">
                  {trackedApp.roomAssignment.status === 'checked_in' ? 'Aktif Menghuni' : 'Siap Ditempati'}
                </span>
              </div>
            </div>
          )}

          {/* Unduh Surat Persetujuan Resmi TTE (Jika Approved) */}
          {trackedApp.approvalLetter && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileCheck2 className="w-4 h-4 text-blue-600" />
                <span>Dokumen Resmi Persetujuan Dinas Kesehatan</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-blue-950 font-mono text-sm">
                    {trackedApp.approvalLetter.letterNumber}
                  </div>
                  <div className="text-blue-800 text-[11px] mt-0.5">
                    Ditandatangani secara elektronik oleh <strong>{trackedApp.approvalLetter.signerName}</strong> ({trackedApp.approvalLetter.signerPosition})
                  </div>
                  <div className="text-[10px] text-blue-600 mt-1 font-mono">
                    Token Verifikasi: {trackedApp.approvalLetter.verificationToken}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {trackedApp.approvalLetter.pdfBlobUrl && (
                    <a
                      href={trackedApp.approvalLetter.pdfBlobUrl}
                      download={`Surat_Persetujuan_RSP_${trackedApp.applicationNumber}.pdf`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh PDF Resmi</span>
                    </a>
                  )}

                  {onOpenVerificationToken && (
                    <button
                      type="button"
                      onClick={() => onOpenVerificationToken(trackedApp.approvalLetter!.verificationToken)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 font-bold text-xs transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Validasi TTE</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Review Dokumen & Catatan Revisi jika ada */}
          {trackedApp.documents && trackedApp.documents.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-3">
              <h4 className="text-sm font-bold text-slate-900">Status Pemeriksaan Berkas</h4>

              <div className="space-y-2 text-xs">
                {trackedApp.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{doc.docName}</div>
                      <div className="text-[11px] text-slate-500">{doc.fileName}</div>
                      {doc.reviewNotes && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 mt-1">
                          Catatan Petugas: {doc.reviewNotes}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border self-start sm:self-auto ${
                        DOCUMENT_STATUS_CONFIG[doc.status]?.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {DOCUMENT_STATUS_CONFIG[doc.status]?.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset / Cari Lagi Button */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setTrackedApp(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              ← Lacak Permohonan Lain
            </button>
            <button
              onClick={onBackToHome}
              className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
