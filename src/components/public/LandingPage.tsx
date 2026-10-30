import React from 'react';
import {
  Building2,
  FileText,
  ShieldCheck,
  Search,
  CheckCircle2,
  HeartPulse,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Bed,
  Users,
  FileCheck,
  ChevronRight,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { storage } from '../../services/storage.ts';
import { generateDeveloperGuidePdf } from '../../services/pdf/developerGuideGenerator.ts';

interface LandingPageProps {
  onStartRegistration: () => void;
  onOpenTracking: () => void;
  onOpenVerification: () => void;
  onOpenLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRegistration,
  onOpenTracking,
  onOpenVerification,
  onOpenLogin,
}) => {
  const rooms = storage.getRooms();
  const totalBeds = rooms.reduce((acc, r) => acc + r.totalBeds, 0);
  const availableBeds = rooms.reduce(
    (acc, r) => acc + (r.status !== 'maintenance' ? r.totalBeds - r.occupiedBeds : 0),
    0
  );

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl border border-blue-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
            <HeartPulse className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>Layanan Publik Resmi Bebas Biaya (Gratis)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Rumah Singgah Pasien <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
              Dinas Kesehatan Daerah
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Fasilitas akomodasi singgah resmi bagi pasien rawat jalan/kontrol lanjutan dan keluarga pendamping yang menjalani rujukan medis ke Rumah Sakit Rujukan Tingkat Lanjut. Pendaftaran daring tanpa perlu membuat akun, cepat, transparan, dan tersertifikasi Tanda Tangan Elektronik resmi (BSrE - BSSN).
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStartRegistration}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Ajukan Pendaftaran Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTracking}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 backdrop-blur-xs transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Lacak Status Permohonan</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80 text-xs">
            <div>
              <div className="text-2xl font-black text-white">{availableBeds} / {totalBeds}</div>
              <div className="text-slate-400 mt-0.5 font-medium">Bed Tersedia Hari Ini</div>
            </div>
            <div>
              <div className="text-2xl font-black text-blue-300">100%</div>
              <div className="text-slate-400 mt-0.5 font-medium">Gratis (Bebas Biaya)</div>
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-300">BSrE BSSN</div>
              <div className="text-slate-400 mt-0.5 font-medium">TTE Digital Resmi</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-300">24 Jam</div>
              <div className="text-slate-400 mt-0.5 font-medium">Siaga Pelayanan</div>
            </div>
          </div>

        </div>
      </section>

      {/* Alur Prosedur Pelayanan */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Alur Pelayanan
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Bagaimana Cara Mendaftar?
          </h2>
          <p className="text-slate-600 text-sm">
            4 langkah mudah mendapatkan persetujuan dan alokasi tempat tinggal sementara
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Pendaftaran Online',
              desc: 'Isi data pasien, pendamping, rumah sakit rujukan, dan unggah berkas pendukung tanpa perlu membuat akun.',
              icon: FileText,
            },
            {
              step: '2',
              title: 'Verifikasi Administrasi',
              desc: 'Petugas Dinas Kesehatan memeriksa kelengkapan dan validitas dokumen rujukan dalam 1x24 jam kerja.',
              icon: ShieldCheck,
            },
            {
              step: '3',
              title: 'Persetujuan & TTE',
              desc: 'Kepala Dinas menandatangani Surat Keputusan resmi secara elektronik tersertifikasi BSrE BSSN.',
              icon: FileCheck,
            },
            {
              step: '4',
              title: 'Alokasi Kamar & Check-In',
              desc: 'Pengelola RSP menyiapkan kamar/bed dan pemohon dapat langsung menempati fasilitas sesuai jadwal.',
              icon: Bed,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all hover:-translate-y-1 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-base flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Persyaratan & Fasilitas */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Persyaratan Berkas */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Syarat Pendaftaran</h3>
              <p className="text-xs text-slate-500">Siapkan dokumen berikut sebelum mengisi formulir</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { title: 'e-KTP Pasien (Wajib)', desc: '16 digit NIK harus terbaca jelas dan masih berlaku' },
              { title: 'Kartu Keluarga / KK (Wajib)', desc: 'Memuat nama pasien dan nama pendamping yang didaftarkan' },
              { title: 'Surat Rujukan RS Asal (Wajib)', desc: 'Surat rujukan berjenjang ke RS rujukan tingkat lanjut' },
              { title: 'Bukti Jadwal Kontrol / Tindakan Medis (Wajib)', desc: 'Surat kontrol dokter atau jadwal kemoterapi/radioterapi/operasi' },
              { title: 'KTP Pendamping (Opsional)', desc: 'KTP asli keluarga yang mendampingi selama di Rumah Singgah' },
              { title: 'Kartu BPJS PBI / SKTM (Opsional)', desc: 'Untuk prioritas alokasi fasilitas kamar' },
            ].map((req, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">{req.title}</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">{req.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fasilitas Rumah Singgah */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Fasilitas yang Disediakan</h3>
              <p className="text-xs text-slate-500">Kenyamanan & kebersihan untuk pasien serta keluarga</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { name: 'Kamar Ber-AC', desc: 'Sirkulasi udara bersih dan sejuk' },
              { name: 'Oksigen Medis', desc: 'Tabung & konsentrator oksigen darurat' },
              { name: 'Kamar Mandi Ramah Difabel', desc: 'Dilengkapi handrail dan akses kursi roda' },
              { name: 'Dapur & Kulkas Bersama', desc: 'Penyimpanan obat dan memasak makanan khusus' },
              { name: 'Ambulance Siaga', desc: 'Fasilitas antar-jemput ke rumah sakit rujukan' },
              { name: 'Wifi & Ruang Istirahat', desc: 'Akses internet dan area santai keluarga' },
            ].map((f, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-slate-900">{f.name}</h4>
                <p className="text-slate-600 text-[11px] mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Prioritas Pasien:</span>
            </div>
            <p className="text-blue-800 text-[11px] leading-relaxed">
              Fasilitas diprioritaskan bagi pasien rujukan berpenyakit kronis (kanker, jantung, hemodialisa rutin, anak) yang berasal dari luar kota dan membutuhkan kontrol berulang.
            </p>
          </div>
        </div>

      </section>

      {/* Info Kontak & Verifikasi Dokumen Publik */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-lg border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <MapPin className="w-4 h-4" />
              <span>Lokasi Rumah Singgah</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Kompleks Rumah Singgah Pasien Dinas Kesehatan, Jl. Raya Semarang - Ambarawa Km 28 (Berjarak ±15 menit dari RS Rujukan Terdekat).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Phone className="w-4 h-4" />
              <span>Kontak & Call Center</span>
            </div>
            <p className="text-xs text-slate-300">
              Hotline Layanan: (024) 8921134 <br />
              WhatsApp Resmi RSP: 0812-3456-7890 <br />
              Email: rsp-dinkes@semarangkab.go.id
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi Keaslian Surat</span>
            </div>
            <p className="text-xs text-slate-300 mb-2">
              Periksa keabsahan tanda tangan elektronik (TTE) pada surat persetujuan melalui token dokumen.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenVerification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
              >
                <span>Buka Halaman Verifikasi Surat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onOpenLogin && (
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors mt-1"
                >
                  <span>Portal Login Petugas & Pimpinan →</span>
                </button>
              )}

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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold border border-indigo-800/80 transition-colors cursor-pointer mt-1"
                title="Buku Panduan Lengkap untuk Programmer & Setup Server"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Unduh Panduan Developer (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
