import React, { useState } from 'react';
import {
  FileText,
  User,
  Users,
  Building,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Eye,
  Trash2,
  Lock,
  Copy,
  Printer,
  Calendar,
  Phone,
  FileCheck2
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Application, DocumentRequirement } from '../../types/models';

interface RegistrationFormProps {
  onSuccess: (app: Application, accessCode: string) => void;
  onCancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{ app: Application; accessCode: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Step 1: Patient Information
  const [nik, setNik] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('');
  const [bpjsNumber, setBpjsNumber] = useState<string>('');
  const [diagnosa, setDiagnosa] = useState<string>('');

  // Step 2: Companion Information
  const [hasCompanion, setHasCompanion] = useState<boolean>(true);
  const [companionName, setCompanionName] = useState<string>('');
  const [companionNik, setCompanionNik] = useState<string>('');
  const [companionRelationship, setCompanionRelationship] = useState<string>('Istri');
  const [companionPhone, setCompanionPhone] = useState<string>('');
  const [companionNeedsBed, setCompanionNeedsBed] = useState<boolean>(true);

  // Step 3: Healthcare & Referral
  const [destinationHospital, setDestinationHospital] = useState<string>('RSUP Dr. Kariadi Semarang');
  const [referralLetterNumber, setReferralLetterNumber] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [plannedCheckInDate, setPlannedCheckInDate] = useState<string>('');
  const [estimatedStayDays, setEstimatedStayDays] = useState<number>(3);

  // Step 4: Documents
  const requirements: DocumentRequirement[] = storage.getDocumentRequirements().filter((r) => r.isActive);
  const [uploadedFiles, setUploadedFiles] = useState<
    Record<
      string,
      {
        fileName: string;
        fileSize: number;
        mimeType: string;
        fileUrl: string;
      }
    >
  >({});

  // Step 5: Privacy Consent
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Validation rules for each step
  const validateStep = (step: number): boolean => {
    const errs: string[] = [];

    if (step === 1) {
      if (!nik || !/^\d{16}$/.test(nik)) {
        errs.push('Nomor Induk Kependudukan (NIK) wajib 16 digit angka.');
      }
      if (!fullName.trim()) {
        errs.push('Nama lengkap pasien wajib diisi sesuai KTP.');
      }
      if (!birthPlace.trim() || !birthDate) {
        errs.push('Tempat dan tanggal lahir pasien wajib diisi.');
      }
      if (!address.trim()) {
        errs.push('Alamat lengkap domisili asal wajib diisi.');
      }
      if (!phone.trim() || phone.length < 10) {
        errs.push('Nomor telepon / WhatsApp aktif wajib diisi (minimal 10 digit).');
      }
    }

    if (step === 2 && hasCompanion) {
      if (!companionName.trim()) {
        errs.push('Nama lengkap pendamping wajib diisi.');
      }
      if (!companionPhone.trim() || companionPhone.length < 10) {
        errs.push('Nomor kontak pendamping wajib diisi.');
      }
    }

    if (step === 3) {
      if (!destinationHospital.trim()) {
        errs.push('Nama Rumah Sakit rujukan tujuan wajib dipilih/diisi.');
      }
      if (!referralLetterNumber.trim()) {
        errs.push('Nomor surat rujukan RS/Puskesmas wajib diisi.');
      }
      if (!appointmentDate) {
        errs.push('Tanggal rencana kunjungan kontrol / jadwal medis wajib diisi.');
      }
      if (!plannedCheckInDate) {
        errs.push('Rencana tanggal check-in masuk Rumah Singgah wajib diisi.');
      }
      if (estimatedStayDays < 1 || estimatedStayDays > 14) {
        errs.push('Estimasi durasi tinggal maksimal 7 hari (dapat diperpanjang kemudian).');
      }
    }

    if (step === 4) {
      // Check mandatory documents
      for (const req of requirements.filter((r) => r.isMandatory)) {
        if (!uploadedFiles[req.id]) {
          errs.push(`Dokumen wajib '${req.name}' belum diunggah.`);
        }
      }
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setErrors([]);
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrors([]);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Simulate file upload or allow real file upload
  const handleFileUpload = (reqId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFiles((prev) => ({
        ...prev,
        [reqId]: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/pdf',
          fileUrl: (reader.result as string) || '',
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // Quick fill sample data for effortless testing
  const handleQuickFillSample = () => {
    setNik('3322151408850004');
    setFullName('Agus Triyanto, S.Pd');
    setBirthPlace('Semarang');
    setBirthDate('1985-08-14');
    setGender('L');
    setAddress('RT 03/RW 02 Kelurahan Bandungan, Kec. Bandungan, Kab. Semarang');
    setPhone('081234998877');
    setEmergencyPhone('081234998888');
    setBpjsNumber('0001928374829');
    setDiagnosa('Pemeriksaan berkala Kardiologi Pasca Pasang Ring Jantung');

    setHasCompanion(true);
    setCompanionName('Endang Sulistyo');
    setCompanionNik('3322155209870001');
    setCompanionRelationship('Istri');
    setCompanionPhone('081234998888');
    setCompanionNeedsBed(true);

    setDestinationHospital('RSUP Dr. Kariadi Semarang');
    setReferralLetterNumber('445/RUJ/BDG/2026/1209');
    const today = new Date();
    const appDate = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const checkDate = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    setAppointmentDate(appDate);
    setPlannedCheckInDate(checkDate);
    setEstimatedStayDays(3);

    // Auto-populate dummy attachments for requirements
    const dummyUploads: typeof uploadedFiles = {};
    requirements.forEach((req) => {
      dummyUploads[req.id] = {
        fileName: `${req.code.toLowerCase()}_sample_document.pdf`,
        fileSize: 450 * 1024,
        mimeType: 'application/pdf',
        fileUrl: 'data:application/pdf;base64,JVBERi0xLjQK...',
      };
    });
    setUploadedFiles(dummyUploads);
  };

  // Submit Application
  const handleSubmit = () => {
    if (!privacyAgreed) {
      setErrors(['Anda harus menyetujui pernyataan kebenaran data & privasi sebelum mengirim.']);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    setTimeout(() => {
      const docPayload = Object.entries(uploadedFiles).map(([reqId, file]) => {
        const req = requirements.find((r) => r.id === reqId);
        return {
          requirementId: reqId,
          docCode: req?.code || 'DOC',
          docName: req?.name || file.fileName,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
        };
      });

      const res = storage.submitPublicApplication({
        patient: {
          nik,
          fullName,
          birthPlace,
          birthDate,
          gender,
          address,
          phone,
          emergencyPhone,
          bpjsNumber,
          diagnosa,
        },
        companion: {
          hasCompanion,
          fullName: hasCompanion ? companionName : undefined,
          nik: hasCompanion ? companionNik : undefined,
          relationship: hasCompanion ? companionRelationship : undefined,
          phone: hasCompanion ? companionPhone : undefined,
          needsAccommodation: hasCompanion ? companionNeedsBed : false,
        },
        destinationHospital,
        referralLetterNumber,
        appointmentDate,
        plannedCheckInDate,
        estimatedStayDays,
        documents: docPayload,
      });

      setIsSubmitting(false);
      setSubmissionResult({ app: res.application, accessCode: res.accessCode });
      onSuccess(res.application, res.accessCode);
    }, 600);
  };

  // --- SUBMISSION SUCCESS RECEIPT VIEW ---
  if (submissionResult) {
    const { app, accessCode } = submissionResult;
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Pendaftaran Berhasil Dikirim!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Permohonan Anda telah tersimpan di sistem Dinas Kesehatan dan akan segera ditinjau oleh staf verifikator.
          </p>
        </div>

        {/* Secure Credentials Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Kredensial Resmi Pelacakan Mandiri</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3.5 rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Nomor Permohonan</span>
              <div className="text-lg font-mono font-black text-blue-950 mt-0.5">
                {app.applicationNumber}
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 relative">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Kode Akses Rahasia</span>
              <div className="text-lg font-mono font-black text-indigo-700 mt-0.5 tracking-wider">
                {accessCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(accessCode);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="absolute top-3 right-3 text-slate-400 hover:text-blue-600 text-xs flex items-center gap-1 font-semibold"
                title="Salin Kode Akses"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 bg-white/70 p-3 rounded-xl border border-blue-100/60 leading-relaxed">
            <strong className="text-slate-800">PENTING:</strong> Simpan Nomor Permohonan dan Kode Akses di atas. Anda akan membutuhkannya bersama 4 digit terakhir NIK untuk mengecek status persetujuan, melihat revisi dokumen, dan mengunduh Surat Keputusan resmi TTE.
          </div>
        </div>

        {/* Ringkasan Pasien */}
        <div className="text-xs space-y-2 border-t border-slate-100 pt-4">
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Nama Pasien:</span>
            <span className="font-bold text-slate-900">{app.patient?.fullName}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">NIK Pasien:</span>
            <span className="font-mono text-slate-700">
              {app.patient?.nik.substring(0, 6)}******{app.patient?.nik.substring(12)}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Faskes Tujuan:</span>
            <span className="font-bold text-slate-900">{app.destinationHospital}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Rencana Check-In:</span>
            <span className="font-bold text-blue-700">{app.plannedCheckInDate} ({app.estimatedStayDays} Hari)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan Bukti</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-colors"
          >
            <span>Kembali ke Beranda</span>
          </button>
        </div>

      </div>
    );
  }

  // --- 5-STEP FORM VIEW ---
  const steps = [
    { num: 1, title: 'Data Pasien', icon: User },
    { num: 2, title: 'Pendamping', icon: Users },
    { num: 3, title: 'Rujukan & Faskes', icon: Building },
    { num: 4, title: 'Unggah Berkas', icon: Upload },
    { num: 5, title: 'Review & Kirim', icon: FileCheck2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header & Quick Sample Fill */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Formulir Pendaftaran Rumah Singgah Pasien
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data secara akurat. Pelayanan ini 100% bebas biaya (Gratis).
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickFillSample}
          className="text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          title="Isi contoh data cepat untuk demo"
        >
          ⚡ Isi Contoh Data Cepat
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div
                key={s.num}
                className={`text-center space-y-1.5 cursor-pointer ${
                  isCurrent ? 'opacity-100' : isCompleted ? 'opacity-90' : 'opacity-40'
                }`}
                onClick={() => {
                  if (isCompleted) setCurrentStep(s.num);
                }}
              >
                <div
                  className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <div className="text-[10px] font-bold text-slate-700 truncate hidden sm:block">
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Validation Error Banner */}
      {errors.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Mohon lengkapi bagian berikut:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-rose-800">
            {errors.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Form Body */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">

        {/* STEP 1: DATA PASIEN */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah 1: Data Identitas Pasien</h3>
              <p className="text-xs text-slate-500">Pastikan NIK dan nama sesuai dengan Kartu Tanda Penduduk asli</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="3322xxxxxxxxxxxx (16 Digit)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{nik.length} / 16 digit</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sesuai KTP / KIA"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Contoh: Semarang"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('L')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      gender === 'L'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Laki-Laki
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('P')}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      gender === 'P'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  No. Telepon / WhatsApp Pasien <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Alamat Lengkap Domisili Asal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="RT/RW, Desa/Kelurahan, Kecamatan, Kabupaten/Kota"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Kartu BPJS (Jika ada)</label>
                <input
                  type="text"
                  value={bpjsNumber}
                  onChange={(e) => setBpjsNumber(e.target.value)}
                  placeholder="13 Digit No. BPJS"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosa Singkat / Alasan Rujukan</label>
                <input
                  type="text"
                  value={diagnosa}
                  onChange={(e) => setDiagnosa(e.target.value)}
                  placeholder="Contoh: Kemoterapi Ca Payudara, dsb."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PENDAMPING */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah 2: Data Pendamping Pasien</h3>
              <p className="text-xs text-slate-500">Pasien dapat didampingi oleh keluarga selama masa tinggal</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">Apakah pasien memiliki pendamping?</h4>
                  <p className="text-[11px] text-slate-500">Maksimal 1 orang pendamping di fasilitas kamar</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasCompanion(true)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                      hasCompanion ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Ya, Ada
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasCompanion(false)}
                    className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                      !hasCompanion ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Tidak
                  </button>
                </div>
              </div>

              {hasCompanion && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Lengkap Pendamping <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companionName}
                      onChange={(e) => setCompanionName(e.target.value)}
                      placeholder="Nama keluarga pendamping"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">NIK Pendamping</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={companionNik}
                      onChange={(e) => setCompanionNik(e.target.value.replace(/\D/g, ''))}
                      placeholder="16 Digit NIK"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hubungan dengan Pasien</label>
                    <select
                      value={companionRelationship}
                      onChange={(e) => setCompanionRelationship(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Suami">Suami</option>
                      <option value="Istri">Istri</option>
                      <option value="Orang Tua (Ayah/Ibu)">Orang Tua (Ayah/Ibu)</option>
                      <option value="Anak Kandung">Anak Kandung</option>
                      <option value="Saudara Kandung">Saudara Kandung</option>
                      <option value="Wali / Lainnya">Wali / Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      No. Kontak Pendamping <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={companionPhone}
                      onChange={(e) => setCompanionPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3 bg-blue-50/60 rounded-xl border border-blue-200/60 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="compBed"
                      checked={companionNeedsBed}
                      onChange={(e) => setCompanionNeedsBed(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded-sm"
                    />
                    <label htmlFor="compBed" className="text-xs text-blue-900 font-semibold cursor-pointer">
                      Membutuhkan alokasi tempat tidur khusus pendamping (Sofa Bed / Bed ekstra jika kamar memungkinkan)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: RUJUKAN & FASKES */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah 3: Rujukan & Jadwal Medis</h3>
              <p className="text-xs text-slate-500">Informasi rumah sakit rujukan dan estimasi periode menginap</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Rumah Sakit Rujukan Tujuan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={destinationHospital}
                  onChange={(e) => setDestinationHospital(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RSUP Dr. Kariadi Semarang">RSUP Dr. Kariadi Semarang</option>
                  <option value="RSUD Tugurejo Semarang">RSUD Tugurejo Semarang</option>
                  <option value="RS Telogorejo Semarang">RS Telogorejo Semarang</option>
                  <option value="RSUP Dr. Sardjito Yogyakarta">RSUP Dr. Sardjito Yogyakarta</option>
                  <option value="RSUD Prof. Dr. Margono Soekarjo Purwokerto">RSUD Prof. Dr. Margono Soekarjo Purwokerto</option>
                  <option value="Lainnya">Faskes Rujukan Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nomor Surat Rujukan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={referralLetterNumber}
                  onChange={(e) => setReferralLetterNumber(e.target.value)}
                  placeholder="Contoh: 445/RUJ/KRD/2026/089"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tanggal Jadwal Kontrol / Tindakan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rencana Tanggal Masuk (Check-In) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={plannedCheckInDate}
                  onChange={(e) => setPlannedCheckInDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Disarankan 1 hari sebelum jadwal tindakan RS</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Estimasi Durasi Tinggal (Hari) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={estimatedStayDays}
                    onChange={(e) => setEstimatedStayDays(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-center focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-slate-500">Hari (Maksimal 7 hari izin awal)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: UNGGAH BERKAS */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah 4: Unggah Dokumen Pendukung</h3>
              <p className="text-xs text-slate-500">Format yang didukung: PDF, JPG, PNG (Maksimal 2-3MB per file)</p>
            </div>

            <div className="space-y-3">
              {requirements.map((req) => {
                const uploaded = uploadedFiles[req.id];
                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      uploaded
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : req.isMandatory
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-dashed border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900">{req.name}</h4>
                          {req.isMandatory ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                              Wajib
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              Opsional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{req.description}</p>
                      </div>

                      {/* Upload Button or File State */}
                      <div className="shrink-0">
                        {uploaded ? (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-800 line-clamp-1 max-w-[140px]">
                                {uploaded.fileName}
                              </span>
                              <span className="text-[10px] text-emerald-600 block">
                                {(uploaded.fileSize / 1024).toFixed(0)} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const next = { ...uploadedFiles };
                                delete next[req.id];
                                setUploadedFiles(next);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                              title="Hapus file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Pilih File</span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(req.id, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & CONSENT */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Langkah 5: Konfirmasi Akhir & Persetujuan Privasi</h3>
              <p className="text-xs text-slate-500">Periksa kembali data Anda sebelum mengirimkan permohonan resmi</p>
            </div>

            {/* Dossier Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                Ringkasan Permohonan
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>Pasien: <strong className="text-slate-900">{fullName}</strong></div>
                <div>NIK: <strong className="font-mono text-slate-900">{nik}</strong></div>
                <div>RS Tujuan: <strong className="text-slate-900">{destinationHospital}</strong></div>
                <div>No. Rujukan: <strong className="text-slate-900">{referralLetterNumber}</strong></div>
                <div>Rencana Check-In: <strong className="text-blue-700">{plannedCheckInDate}</strong> ({estimatedStayDays} Hari)</div>
                <div>Pendamping: <strong className="text-slate-900">{hasCompanion ? companionName : 'Tanpa Pendamping'}</strong></div>
                <div>Total Berkas Terunggah: <strong className="text-emerald-700">{Object.keys(uploadedFiles).length} Dokumen</strong></div>
              </div>
            </div>

            {/* Privacy Notice & Consent Agreement */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-blue-900">
                <Lock className="w-4 h-4 text-blue-700" />
                <span>Pernyataan Keaslian Berkas & Perlindungan Data Pribadi</span>
              </div>
              <p className="text-[11px] text-blue-900/80 leading-relaxed">
                Seluruh data identitas pasien dan dokumen rujukan medis yang diunggah hanya digunakan untuk keperluan verifikasi kelayakan akomodasi Rumah Singgah Pasien Dinas Kesehatan. Data dilindungi sesuai Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022).
              </p>
              <label className="flex items-start gap-2 pt-1 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm mt-0.5"
                />
                <span className="text-xs">
                  Saya menyatakan bahwa data yang diisi adalah benar, sah, dan dapat dipertanggungjawabkan secara hukum.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Batal
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:translate-x-0.5"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !privacyAgreed}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${
                isSubmitting || !privacyAgreed
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
              }`}
            >
              {isSubmitting ? (
                <span>Memproses Pendaftaran...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Permohonan Sekarang</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
