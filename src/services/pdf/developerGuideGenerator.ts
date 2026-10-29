import { jsPDF } from 'jspdf';

export function generateDeveloperGuidePdf(): { blob: Blob; url: string; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 20;

  const checkPageOverflow = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = 20;
      renderPageHeader();
    }
  };

  const renderPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('BUKU PANDUAN PENGEMBANG (DEVELOPER MANUAL) — SIM-RSP DINAS KESEHATAN', margin, 12);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 14, pageWidth - margin, 14);
  };

  const renderPageFooter = (pageNum: number, totalPagesPlaceholder = '6') => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.text('Dokumentasi Resmi Arsitektur & Implementasi Sistem', margin, pageHeight - 8);
    doc.text(`Halaman ${pageNum}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ==========================================
  // HALAMAN 1: COVER & RINGKASAN SISTEM
  // ==========================================
  // Background Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, 20, contentWidth, 54, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('BUKU PANDUAN LENGKAP PENGEMBANG', margin + 8, 36);
  doc.setFontSize(13);
  doc.setTextColor(147, 197, 253); // blue-300
  doc.text('SIM-RSP: Sistem Reservasi Rumah Singgah Pasien', margin + 8, 44);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Dinas Kesehatan Pemerintah Daerah • Standar TTE BSrE - BSSN & UU PDP', margin + 8, 52);
  doc.text('Edisi Implementasi: Node.js (React 19) & Migrasi Laravel 11/12 (PHP 8.5)', margin + 8, 58);

  currentY = 82;

  // Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Penulis Dokumen : Tim Arsitektur Sistem Informasi Kesehatan', margin + 5, currentY + 7);
  doc.text('Target Pembaca   : Full-Stack Developer, DevOps Engineer, Technical Lead, & Portfolio Evaluator', margin + 5, currentY + 13);
  doc.text('Versi Standar    : Production-Ready (On-Premise & Cloud Run Architecture)', margin + 5, currentY + 19);

  currentY += 32;

  // Table of Contents
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('DAFTAR ISI PANDUAN TEKNIS', margin, currentY);
  currentY += 8;

  const tocItems = [
    { no: 'BAB 1', title: 'Panduan Instalasi & Deployment di Server Internal (On-Premise / VPS)', page: 'Hal. 2' },
    { no: 'BAB 2', title: 'Petunjuk Pengembangan, Penyesuaian Fitur, & Modifikasi Alur Kerja', page: 'Hal. 3' },
    { no: 'BAB 3', title: 'Pemanfaatan Web App sebagai Portofolio Unggulan Programmer (Showcase)', page: 'Hal. 4' },
    { no: 'BAB 4', title: 'Spesifikasi Teknis: Konfigurasi .env, Database, Model, Controller, & View', page: 'Hal. 5' },
    { no: 'BAB 5', title: 'Cheatsheet Perintah & Troubleshooting Server Produksi', page: 'Hal. 6' },
  ];

  tocItems.forEach((item) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text(item.no, margin + 3, currentY + 4.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(item.title, margin + 22, currentY + 4.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(item.page, pageWidth - margin - 3, currentY + 4.8, { align: 'right' });
    currentY += 9;
  });

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Sekilas Tentang Sistem SIM-RSP:', margin, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const introText = 
    'SIM-RSP adalah sistem registrasi dan reservasi fasilitas rumah singgah pasien yang dirancang untuk melayani warga kurang mampu / pasien rujukan medis. Sistem menerapkan Role-Based Access Control (RBAC) 5 tingkat, proteksi brute-force lacak permohonan 3 lapis, penandatanganan elektronik tersertifikasi BSrE BSSN, serta algoritma pencegahan jadwal bentrok (anti-double booking) pada kamar dan bed.';
  doc.text(doc.splitTextToSize(introText, contentWidth), margin, currentY);

  renderPageFooter(1);

  // ==========================================
  // HALAMAN 2: INSTALASI SERVER INTERNAL
  // ==========================================
  doc.addPage();
  renderPageHeader();
  currentY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text('BAB 1: INSTALASI MENGGUNAKAN SERVER INTERNAL (ON-PREMISE / VPS)', margin, currentY);
  currentY += 8;

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1.1 Kebutuhan Sistem Minimum (Prerequisites)', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const prereqs = [
    '• Sistem Operasi: Ubuntu Server 22.04 LTS / 24.04 LTS atau Rocky Linux 9.',
    '• Hardware: Minimal 2 Core CPU, 4 GB RAM, 20 GB SSD Storage.',
    '• Web Server & Proxy: Nginx 1.22+ dengan modul SSL (Let\'s Encrypt / Wildcard Pemda).',
    '• Database Engine: PostgreSQL 15+ atau MySQL 8.0 / MariaDB 10.11.',
    '• Runtime: Node.js 20+ LTS / PHP 8.4 atau 8.5 (dengan curl, openssl, gd, mbstring, pdo).',
  ];
  prereqs.forEach((p) => {
    doc.text(p, margin + 2, currentY);
    currentY += 4.5;
  });

  currentY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1.2 Langkah Instalasi Opsi A: Stack Node.js (React SPA + Express Service)', margin, currentY);
  currentY += 5;

  const nodeInstallCode = [
    '# 1. Masuk ke direktori server internal',
    'git clone https://github.com/instansi/sim-rsp-dinkes.git /var/www/sim-rsp',
    'cd /var/www/sim-rsp',
    '',
    '# 2. Pasang dependensi paket',
    'npm install --omit=dev',
    '',
    '# 3. Build aset statis produksi',
    'npm run build',
    '',
    '# 4. Jalankan process manager PM2 untuk daemon persistensi',
    'sudo npm install -g pm2',
    'pm2 start npm --name "sim-rsp-app" -- run dev -- --port 3000 --host 0.0.0.0',
    'pm2 save && pm2 startup',
  ];

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 42, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  let codeY = currentY + 4;
  nodeInstallCode.forEach((line) => {
    doc.text(line, margin + 4, codeY);
    codeY += 3.2;
  });
  currentY += 46;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1.3 Langkah Instalasi Opsi B: Stack Laravel 11/12 (PHP 8.5 + Nginx)', margin, currentY);
  currentY += 5;

  const laravelInstallCode = [
    '# 1. Install dependensi PHP & ekstensi resmi',
    'sudo apt update && sudo apt install -y php8.5-fpm php8.5-pgsql php8.5-gd php8.5-curl',
    'cd /var/www/sim-rsp-laravel',
    'composer install --optimize-autoloader --no-dev',
    '',
    '# 2. Salin .env dan generate Application Key',
    'cp .env.example .env && php artisan key:generate',
    '',
    '# 3. Jalankan migrasi dan seeder awal 19 tabel',
    'php artisan migrate:fresh --seed',
    'php artisan storage:link',
    '',
    '# 4. Atur hak akses folder storage dan bootstrap cache',
    'sudo chown -R www-data:www-data storage bootstrap/cache',
    'sudo chmod -R 775 storage bootstrap/cache',
  ];

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 44, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(241, 245, 249);
  codeY = currentY + 4;
  laravelInstallCode.forEach((line) => {
    doc.text(line, margin + 4, codeY);
    codeY += 3.2;
  });
  currentY += 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1.4 Konfigurasi Reverse Proxy Nginx + SSL HTTPS', margin, currentY);
  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Arahkan port lokal 3000 atau PHP-FPM socket ke domain naskah dinas, lalu aktifkan enkripsi SSL:', margin, currentY);
  currentY += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('sudo certbot --nginx -d simrsp.dinkes.pemda.go.id', margin + 4, currentY);

  renderPageFooter(2);

  // ==========================================
  // HALAMAN 3: PENYESUAIAN & MODIFIKASI FITUR
  // ==========================================
  doc.addPage();
  renderPageHeader();
  currentY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text('BAB 2: PEMROGRAMAN & PENYESUAIAN FITUR SISTEM', margin, currentY);
  currentY += 8;

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2.1 Menambahkan Field Baru pada Formulir Pendaftaran Pasien', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const stepAddFields = [
    '1. Edit Interface Model (src/types/models.ts atau app/Models/Patient.php):',
    '   Tambahkan property baru, misalnya: gol_darah?: string; jenis_penyakit?: string;',
    '2. Update Komponen Formulir (src/components/public/RegistrationForm.tsx):',
    '   Tambahkan state hook useState() dan input tag pada Langkah 1 formulir.',
    '3. Update Service Penyimpanan (src/services/storage.ts atau PublicRegistrationController.php):',
    '   Masukkan field baru tersebut ke dalam payload objek simpan pasien & validasi input.',
  ];
  stepAddFields.forEach((s) => {
    doc.text(s, margin + 2, currentY);
    currentY += 4.8;
  });

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2.2 Menyesuaikan Kop Surat & Format Nomor Keputusan Resmi', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const letterConfigInfo = 
    'Konfigurasi kop surat resmi dan data penandatangan dapat diubah tanpa compile ulang melalui Super Admin Dashboard menu "Parameter Instansi" atau langsung pada src/services/pdf/letterGenerator.ts. Format nomor surat mendukung placeholder dinamis: 440/{SEQ}/DINKES-RSP/{ROMAN_MONTH}/{YEAR}.';
  doc.text(doc.splitTextToSize(letterConfigInfo, contentWidth), margin, currentY);
  currentY += 14;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2.3 Modifikasi Alur Kerja Status (State Machine Enforcement)', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const stateMachineExplanation = [
    'Transisi status diatur ketat oleh ALLOWED_APPLICATION_TRANSITIONS di src/types/workflow.ts:',
    '• submitted -> under_review | cancelled',
    '• under_review -> needs_revision | verified | rejected',
    '• verified -> pending_decision (meja Kepala Dinas)',
    '• pending_decision -> approved | rejected | needs_revision',
    '• approved -> memicu dispatch TTE BSrE, pembuatan QR token, dan antrean penempatan kamar.',
  ];
  stateMachineExplanation.forEach((s) => {
    doc.text(s, margin + 2, currentY);
    currentY += 4.8;
  });

  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2.4 Menghubungkan Gateway TTE Riil (BSrE BSSN)', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const bsreSteps = 
    'Aplikasi telah mengadopsi interface modular IEsignProvider. Untuk beralih dari MockSandbox ke API BSrE Production, cukup buat class BsreProductionProvider yang mengimplementasikan IEsignProvider dengan endpoint https://esign.bssn.go.id/api/v2/sign/pdf dan kirimkan sertifikat digital p12 / token API resmi yang diterbitkan oleh BSSN.';
  doc.text(doc.splitTextToSize(bsreSteps, contentWidth), margin, currentY);

  renderPageFooter(3);

  // ==========================================
  // HALAMAN 4: PORTOFOLIO & SHOWCASE UNGGULAN
  // ==========================================
  doc.addPage();
  renderPageHeader();
  currentY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text('BAB 3: PANDUAN MENJADIKAN WEB APP INI SEBAGAI PORTOFOLIO UNGGULAN', margin, currentY);
  currentY += 8;

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3.1 Nilai Jual & Arsitektur Enterprise yang Perlu Ditekankan', margin, currentY);
  currentY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const portfolioPoints = [
    '1. Sistem Berstandar Sektor Publik (GovTech): Mengadopsi tata naskah dinas resmi, hirarki persetujuan bertingkat, dan format surat keputusan pemerintah daerah.',
    '2. Implementasi Tanda Tangan Elektronik (TTE) BSrE - BSSN: Membuktikan keahlian dalam integrasi kriptografi dokumen, perhitungan hash SHA-256, dan validasi QR Code publik.',
    '3. Algoritma Pencegahan Konflik Kamar (No Double-Booking): Mendemonstrasikan penguasaan concurrency control dan transactional locking untuk alokasi resource fisik terbatas.',
    '4. Kepatuhan UU Pelindungan Data Pribadi (UU PDP No. 27/2022): Penyamaran data sensitif (NIK 16 digit masking), isolasi private storage berkas medis, dan pelacakan anti brute-force.',
    '5. Role-Based Access Control (RBAC) 5 Tingkat: Pemisahan tegas wewenang publik, verifikator teknis, pejabat berwenang tanda tangan, pengelola fasilitas, dan administrator.',
  ];
  portfolioPoints.forEach((p) => {
    doc.text(doc.splitTextToSize(p, contentWidth - 4), margin + 2, currentY);
    currentY += 8.5;
  });

  currentY += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3.2 Deskripsi Proyek Siap Pakai untuk CV / Resume / LinkedIn', margin, currentY);
  currentY += 5;

  const cvText = 
    '"Merancang dan membangun Sistem Informasi Pendaftaran dan Manajemen Reservasi Rumah Singgah Pasien Dinas Kesehatan (SIM-RSP). Mengimplementasikan alur verifikasi berkas medis tanpa akun, integrasi simulasi TTE BSrE BSSN dengan QR validator, algoritma alokasi bed anti double-booking, 19 entitas database terelasi, dan audit logging dengan proteksi data pribadi pasien."';

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text(doc.splitTextToSize(cvText, contentWidth - 8), margin + 4, currentY + 5);
  currentY += 27;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3.3 Poin Tanya-Jawab Teknis saat Interview Kerja (Technical Interview Prep)', margin, currentY);
  currentY += 5;

  const interviewQnA = [
    {
      q: 'Q: Bagaimana Anda mencegah dua pasien mendapatkan bed yang sama di tanggal bersamaan?',
      a: 'A: "Saya menggunakan algoritma Overlapping Interval Check dan Pessimistic Database Locking (lockForUpdate) dalam DB::transaction untuk mencegah race-condition saat checkout dan booking."',
    },
    {
      q: 'Q: Mengapa publik tidak dibuatkan akun login permanen?',
      a: 'A: "Prinsip Data Minimization dan User Accessibility. Warga sakit/keluarga membutuhkan akses cepat tanpa hambatan pendaftaran akun. Keamanan dialihkan ke pelacakan tri-faktor + brute force lockout."',
    },
    {
      q: 'Q: Bagaimana cara memastikan surat persetujuan tidak dipalsukan?',
      a: 'A: "Setiap surat memiliki SHA-256 hash unik yang ditanamkan sebelum dan setelah TTE, dilengkapi token verifikasi dinamis yang dapat diverifikasi secara publik via pemindaian QR code."',
    },
  ];

  interviewQnA.forEach((qa) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 58, 138);
    doc.text(qa.q, margin + 2, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(qa.a, contentWidth - 4), margin + 2, currentY);
    currentY += 7.5;
  });

  renderPageFooter(4);

  // ==========================================
  // HALAMAN 5: KONFIGURASI ENV, DB, MVC
  // ==========================================
  doc.addPage();
  renderPageHeader();
  currentY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text('BAB 4: KONFIGURASI .ENV, DATABASE, CONTROLLER, MODEL, & VIEW', margin, currentY);
  currentY += 8;

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4.1 Format Konfigurasi Berkas .env', margin, currentY);
  currentY += 5;

  const envConfig = [
    'APP_NAME="SIM-RSP Dinas Kesehatan"',
    'APP_ENV=production',
    'APP_KEY=base64:generated_app_key_here...',
    'APP_DEBUG=false',
    'APP_URL=https://simrsp.dinkes.pemda.go.id',
    '',
    'DB_CONNECTION=pgsql',
    'DB_HOST=127.0.0.1',
    'DB_PORT=5432',
    'DB_DATABASE=simrsp_db',
    'DB_USERNAME=dinkes_user',
    'DB_PASSWORD=SecurePasswordDb123!',
    '',
    'FILESYSTEM_DISK=private',
    'BSRE_ENDPOINT="https://esign.bssn.go.id"',
    'BSRE_API_KEY="bsre_live_api_key_here"',
  ];

  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 48, 'F');
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(241, 245, 249);
  codeY = currentY + 4;
  envConfig.forEach((line) => {
    doc.text(line, margin + 4, codeY);
    codeY += 2.9;
  });
  currentY += 53;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4.2 Pembagian Tanggung Jawab Kode (Clean Architecture MVC / Service)', margin, currentY);
  currentY += 5;

  const mvcMap = [
    { layer: 'MODELS', desc: 'Patient, Application, DocumentRequirement, Room, Bed, RoomAssignment, ApprovalLetter, AuditLog. Mendefinisikan relasi Eloquent dan cast tipe data.' },
    { layer: 'CONTROLLER', desc: 'Menerima HTTP Request, validasi form request, mengeksekusi service, dan mengembalikan JSON / Inertia response tanpa business logic berlebih.' },
    { layer: 'SERVICES', desc: 'EsignBsreService (integrasi API), LetterPdfService (rendering PDF), RoomCapacityEngine (kalkulasi okupansi dan deteksi bentrok jadwal).' },
    { layer: 'VIEWS / PAGES', desc: 'Komponen React Tailwind yang terisolasi per peran: LandingPage, RegistrationForm, TrackingPage, DocumentReviewModal, & Dashboard.' },
  ];

  mvcMap.forEach((m) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 58, 138);
    doc.text(`• ${m.layer}:`, margin + 2, currentY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(doc.splitTextToSize(m.desc, contentWidth - 28), margin + 28, currentY);
    currentY += 8.5;
  });

  currentY += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4.3 Perintah Artisan Esensial untuk Maintenance Harian', margin, currentY);
  currentY += 5;

  const artisanCommands = [
    'php artisan queue:work --tries=3         # Menjalankan background worker untuk API TTE BSrE',
    'php artisan route:cache && php artisan config:cache  # Optimasi performa produksi',
    'php artisan migrate --force              # Menjalankan migrasi database di server produksi',
  ];
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  artisanCommands.forEach((cmd) => {
    doc.text(cmd, margin + 4, currentY);
    currentY += 4.5;
  });

  renderPageFooter(5);

  // ==========================================
  // HALAMAN 6: SUMMARY & VERIFIKASI SELESAI
  // ==========================================
  doc.addPage();
  renderPageHeader();
  currentY = 22;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text('BAB 5: CHECKLIST DEPLOYMENT & TROUBLESHOOTING', margin, currentY);
  currentY += 8;

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5.1 Checklist Kesiapan Go-Live Server Internal', margin, currentY);
  currentY += 5;

  const checklist = [
    '[✓] Hak akses folder private storage terkunci (hanya dapat dibaca via controller bertoken).',
    '[✓] Kunci rahasia APP_KEY dan kredensial database tidak menggunakan default password.',
    '[✓] Sertifikat SSL HTTPS aktif dan terkonfigurasi redirect HTTP ke HTTPS.',
    '[✓] Rate limiting pada endpoint tracking dan staff login telah diverifikasi (5x failed lockout).',
    '[✓] Worker antrean (queue) terdaftar pada systemd / supervisord agar otomatis restart.',
    '[✓] Backup otomatis database berkala (cron job pg_dump / mysqldump terenkripsi).',
  ];

  checklist.forEach((c) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(c, margin + 2, currentY);
    currentY += 5;
  });

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5.2 Solusi Cepat Masalah Umum (Troubleshooting)', margin, currentY);
  currentY += 5;

  const troubles = [
    {
      t: '1. Error 419 Page Expired (CSRF Token Mismatch)',
      s: 'Solusi: Pastikan domain pada APP_URL di .env sama persis dengan URL browser dan konfigurasi SESSION_SECURE_COOKIE=true saat berjalan di HTTPS.',
    },
    {
      t: '2. PDF Generator Blank / Font Bahasa Indonesia Tidak Muncul',
      s: 'Solusi: Pada dompdf / jsPDF, gunakan font standar seperti Helvetica / Times atau install TrueType Font (TTF) DejaVu Sans pada storage server.',
    },
    {
      t: '3. Webhook BSrE Tidak Menerima Notifikasi TTE Selesai',
      s: 'Solusi: Pastikan endpoint webhook memiliki IP publik yang dapat dijangkau oleh server BSSN dan gunakan HMAC signature validation untuk autentikasi payload.',
    },
  ];

  troubles.forEach((tb) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text(tb.t, margin + 2, currentY);
    currentY += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(tb.s, contentWidth - 4), margin + 4, currentY);
    currentY += 7.5;
  });

  currentY += 10;
  // Official Stamp Box
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('DOKUMEN PANDUAN PENGEMBANG INI DIGENERATE SECARA OTOMATIS OLEH SISTEM', margin + 6, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SIM-RSP Dinas Kesehatan • Modul Developer Kit v2.4 • Kompatibel Node.js 20+ & Laravel 11/12 PHP 8.5', margin + 6, currentY + 13);
  doc.text(`Waktu Generate Dokumen: ${new Date().toLocaleString('id-ID')} WIB`, margin + 6, currentY + 19);

  renderPageFooter(6);

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const fileName = 'Buku_Panduan_Developer_SIM_RSP_Dinkes.pdf';

  return { blob, url, fileName };
}
