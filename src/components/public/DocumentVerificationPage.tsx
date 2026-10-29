import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, Search, FileText, Lock, Building2, ArrowLeft } from 'lucide-react';
import { storage } from '../../services/storage';
import { ApprovalLetter, Application } from '../../types/models';

interface DocumentVerificationPageProps {
  initialToken?: string;
  onBack: () => void;
}

export const DocumentVerificationPage: React.FC<DocumentVerificationPageProps> = ({ initialToken, onBack }) => {
  const [tokenInput, setTokenInput] = useState<string>(initialToken || 'VLD-RSP-2026-084291');
  const [verifiedResult, setVerifiedResult] = useState<{
    letter: ApprovalLetter;
    app: Application;
  } | null>(null);
  const [searched, setSearched] = useState<boolean>(false);

  const handleVerify = (tokenToVerify?: string) => {
    const token = (tokenToVerify || tokenInput).trim().toUpperCase();
    setSearched(true);

    const apps = storage.getApplications();
    const matchedApp = apps.find(
      (a) => a.approvalLetter && a.approvalLetter.verificationToken.toUpperCase() === token
    );

    if (matchedApp && matchedApp.approvalLetter) {
      setVerifiedResult({
        letter: matchedApp.approvalLetter,
        app: matchedApp,
      });
    } else {
      setVerifiedResult(null);
    }
  };

  useEffect(() => {
    if (initialToken) {
      handleVerify(initialToken);
    }
  }, [initialToken]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
          Layanan Publik BSrE
        </span>
      </div>

      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto shadow-inner">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Verifikasi Keaslian Naskah Dinas Elektronik
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Pusat validasi resmi tanda tangan elektronik (TTE) Balai Sertifikasi Elektronik (BSrE - BSSN) Surat Persetujuan Layanan Rumah Singgah Pasien.
        </p>
      </div>

      {/* Token Input Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Masukkan Token Verifikasi (Contoh: VLD-RSP-2026-084291)"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-mono text-xs uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Validasi Naskah</span>
          </button>
        </form>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Token ini tertera pada pojok bawah surat resmi dan pada QR Code yang dicetak.</span>
        </div>
      </div>

      {/* Verification Result */}
      {searched && verifiedResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Dokumen Resmi Sah & Terverifikasi
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Surat Keterangan Persetujuan Rumah Singgah Pasien
              </h3>
            </div>
          </div>

          {/* Certificate metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Nomor Naskah Resmi:</span>
              <span className="font-mono font-bold text-slate-900">{verifiedResult.letter.letterNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Tanggal Penetapan:</span>
              <span className="font-bold text-slate-900">{verifiedResult.letter.letterDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Pejabat Penandatangan:</span>
              <span className="font-bold text-slate-900">{verifiedResult.letter.signerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Jabatan & Instansi:</span>
              <span className="font-bold text-slate-900">{verifiedResult.letter.signerPosition}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Inisial Penerima Manfaat:</span>
              <span className="font-bold text-slate-900">
                {verifiedResult.app.patient?.fullName.split(' ')[0]}*** (NIK: {verifiedResult.app.patient?.nik.substring(0, 6)}******)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Otoritas Sertifikasi (CA):</span>
              <span className="font-bold text-blue-700">BSrE - Badan Siber dan Sandi Negara (BSSN)</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
            Integritas dokumen terjamin. SHA-256 hash:{' '}
            <span className="font-mono text-[10px] text-blue-950 font-bold">
              {verifiedResult.letter.documentHash}
            </span>
          </div>
        </div>
      )}

      {searched && !verifiedResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-300 shadow-md text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Naskah Tidak Ditemukan</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Token verifikasi &quot;{tokenInput}&quot; tidak terdaftar pada pangkalan data naskah dinas resmi Dinas Kesehatan. Mohon periksa kembali token atau hubungi kantor Dinas Kesehatan.
          </p>
        </div>
      )}

    </div>
  );
};
