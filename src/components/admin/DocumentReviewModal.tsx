import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Building,
  Calendar,
  Send,
  Eye,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { storage } from '../../services/storage';
import { useAuth } from '../../services/auth/authContext';
import { Application, ApplicationDocument, DocumentStatus } from '../../types/models';
import { DOCUMENT_STATUS_CONFIG } from '../../types/workflow';

interface DocumentReviewModalProps {
  application: Application;
  onClose: () => void;
  onRefresh: () => void;
}

export const DocumentReviewModal: React.FC<DocumentReviewModalProps> = ({
  application,
  onClose,
  onRefresh,
}) => {
  const { currentUser } = useAuth();
  const [selectedDocId, setSelectedDocId] = useState<string>(
    application.documents?.[0]?.id || ''
  );
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>(() => {
    const notes: Record<string, string> = {};
    application.documents?.forEach((d) => {
      notes[d.id] = d.reviewNotes || '';
    });
    return notes;
  });
  const [docStatuses, setDocStatuses] = useState<Record<string, DocumentStatus>>(() => {
    const statuses: Record<string, DocumentStatus> = {};
    application.documents?.forEach((d) => {
      statuses[d.id] = d.status;
    });
    return statuses;
  });

  const [generalComment, setGeneralComment] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const docs = application.documents || [];
  const selectedDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  const requirements = storage.getDocumentRequirements();
  const mandatoryReqs = requirements.filter((r) => r.isMandatory && r.isActive);

  // Check if all mandatory documents have been marked 'valid'
  const allMandatoryValid = mandatoryReqs.every((req) => {
    const doc = docs.find((d) => d.requirementId === req.id || d.docCode === req.code);
    return doc && docStatuses[doc.id] === 'valid';
  });

  const handleUpdateDocStatus = (docId: string, status: DocumentStatus) => {
    setDocStatuses((prev) => ({ ...prev, [docId]: status }));
    const note = reviewNotes[docId] || '';
    storage.reviewDocumentItem(application.id, docId, status, note, currentUser);
  };

  const handleSaveDocNote = (docId: string, note: string) => {
    setReviewNotes((prev) => ({ ...prev, [docId]: note }));
    const status = docStatuses[docId] || 'pending_review';
    storage.reviewDocumentItem(application.id, docId, status, note, currentUser);
  };

  // Action 1: Return for revision
  const handleRequestRevision = () => {
    setIsProcessing(true);
    setErrorMsg('');

    const res = storage.transitionApplicationStatus(
      application.id,
      'needs_revision',
      currentUser,
      generalComment || 'Terdapat dokumen yang perlu diperbaiki sesuai catatan per dokumen.'
    );

    setIsProcessing(false);
    if (res.success) {
      onRefresh();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  // Action 2: Verify Administrative
  const handleVerifyApplication = () => {
    setIsProcessing(true);
    setErrorMsg('');

    const res = storage.verifyApplicationAdministrative(
      application.id,
      generalComment || 'Berkas lengkap dan sesuai kriteria.',
      currentUser
    );

    setIsProcessing(false);
    if (res.success) {
      onRefresh();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  // Action 3: Administrative Rejection
  const handleRejectAdministrative = () => {
    if (!generalComment.trim()) {
      setErrorMsg('Alasan penolakan administratif wajib diisi secara transparan.');
      return;
    }

    setIsProcessing(true);
    const res = storage.transitionApplicationStatus(
      application.id,
      'rejected',
      currentUser,
      generalComment
    );
    setIsProcessing(false);

    if (res.success) {
      onRefresh();
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base">Pemeriksaan Berkas & Verifikasi</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-blue-300">
                  {application.applicationNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pasien: {application.patient?.fullName} | NIK: {application.patient?.nik.substring(0, 6)}******
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Patient Medical Dossier Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">RS Rujukan</span>
              <p className="font-bold text-slate-900 mt-0.5">{application.destinationHospital}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">No. Rujukan RS</span>
              <p className="font-bold text-slate-900 mt-0.5">{application.referralLetterNumber}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Jadwal Kontrol Medis</span>
              <p className="font-bold text-blue-700 mt-0.5">{application.appointmentDate}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Rencana Check-In</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {application.plannedCheckInDate} ({application.estimatedStayDays} Hari)
              </p>
            </div>
          </div>

          {/* Document Tabs & Detailed Review View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Document List Sidebar */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block mb-1">Daftar Dokumen ({docs.length}):</span>
              {docs.map((doc) => {
                const status = docStatuses[doc.id] || doc.status;
                const isSelected = doc.id === selectedDocId;
                const req = requirements.find((r) => r.id === doc.requirementId || r.code === doc.docCode);
                const isMandatory = req?.isMandatory ?? true;

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 shadow-xs ring-2 ring-blue-100'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 truncate max-w-[140px]">
                        {doc.docName}
                      </span>
                      {isMandatory && (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                          Wajib
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">{doc.fileName}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold border ${
                          DOCUMENT_STATUS_CONFIG[status]?.badgeColor || 'bg-slate-100'
                        }`}
                      >
                        {DOCUMENT_STATUS_CONFIG[status]?.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Document Inspector Panel */}
            {selectedDoc && (
              <div className="md:col-span-2 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedDoc.docName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      File: {selectedDoc.fileName} ({(selectedDoc.fileSize / 1024).toFixed(0)} KB)
                    </p>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateDocStatus(selectedDoc.id, 'valid')}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                        docStatuses[selectedDoc.id] === 'valid'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valid</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateDocStatus(selectedDoc.id, 'revision_requested')}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                        docStatuses[selectedDoc.id] === 'revision_requested'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-orange-50'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Revisi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateDocStatus(selectedDoc.id, 'invalid')}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                        docStatuses[selectedDoc.id] === 'invalid'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Document Preview Window */}
                <div className="h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4 relative overflow-hidden group">
                  <FileText className="w-10 h-10 text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-300">{selectedDoc.fileName}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format: {selectedDoc.mimeType} | Versi Berkas: #{selectedDoc.version}
                  </p>
                  <div className="absolute inset-0 bg-blue-950/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-blue-200 px-3 py-1.5 rounded-lg bg-blue-800 border border-blue-600">
                      Dokumen Aman Terisolasi (Private Storage)
                    </span>
                  </div>
                </div>

                {/* Specific Notes for this document */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catatan Khusus untuk Dokumen Ini:
                  </label>
                  <input
                    type="text"
                    value={reviewNotes[selectedDoc.id] || ''}
                    onChange={(e) => handleSaveDocNote(selectedDoc.id, e.target.value)}
                    placeholder="Contoh: Foto dokumen buram, mohon scan ulang cap rumah sakit"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* General Verification Conclusion & Mandatory Rules Check */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-950">Catatan Kesimpulan Verifikator:</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  allMandatoryValid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {allMandatoryValid ? '✓ Seluruh Berkas Wajib Valid' : '⚠ Masih ada berkas wajib belum valid'}
              </span>
            </div>

            <textarea
              rows={2}
              value={generalComment}
              onChange={(e) => setGeneralComment(e.target.value)}
              placeholder="Tuliskan catatan verifikasi administrasi atau alasan keputusan..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRejectAdministrative}
              disabled={isProcessing}
              className="px-3 py-2 rounded-xl font-bold bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
            >
              Tolak Administrasi
            </button>

            <button
              type="button"
              onClick={handleRequestRevision}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
            >
              Minta Revisi Dokumen
            </button>

            <button
              type="button"
              onClick={handleVerifyApplication}
              disabled={isProcessing || !allMandatoryValid}
              className={`px-5 py-2 rounded-xl font-bold text-white transition-all shadow-md flex items-center gap-1.5 ${
                !allMandatoryValid
                  ? 'bg-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
              title={
                !allMandatoryValid
                  ? 'Seluruh dokumen wajib harus berstatus Valid sebelum dapat diteruskan ke Kepala Dinas'
                  : 'Teruskan berkas yang telah terverifikasi ke Kepala Dinas'
              }
            >
              <Send className="w-3.5 h-3.5" />
              <span>Verifikasi & Teruskan ke Kepala Dinas</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
