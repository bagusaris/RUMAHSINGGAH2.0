import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Application, ApprovalLetter } from '../../types/models';

export interface LetterConfig {
  provinceName: string;
  cityName: string;
  agencyName: string;
  agencyAddress: string;
  agencyPhone: string;
  agencyEmail: string;
  directorName: string;
  directorNip: string;
  directorPosition: string;
}

export const DEFAULT_INSTITUTION_CONFIG: LetterConfig = {
  provinceName: 'PEMERINTAH PROVINSI JAWA TENGAH',
  cityName: 'KABUPATEN SEMARANG',
  agencyName: 'DINAS KESEHATAN',
  agencyAddress: 'Jl. Pemuda No. 128, Ambarawa, Telp. (024) 8921134, Fax (024) 8921135',
  agencyPhone: '(024) 8921134 / Call Center RSP: 0812-3456-7890',
  agencyEmail: 'dinkes@semarangkab.go.id | rsp-dinkes@semarangkab.go.id',
  directorName: 'dr. H. Hendro Supriyanto, M.Kes',
  directorNip: '19740512 200212 1 003',
  directorPosition: 'Kepala Dinas Kesehatan',
};

export async function generateApprovalLetterPdf(
  app: Application,
  letter: ApprovalLetter,
  config: LetterConfig = DEFAULT_INSTITUTION_CONFIG
): Promise<{ pdfBlob: Blob; pdfDataUrl: string; qrDataUrl: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const verificationUrl = `${window.location.origin}/?verify=${letter.verificationToken}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1e3a8a',
      light: '#ffffff',
    },
  });

  // --- KOP SURAT DINAS KESEHATAN RESMI ---
  // Background emblem simulation circle
  doc.setFillColor(240, 244, 255);
  doc.circle(28, 25, 12, 'F');
  
  // Bakti Husada Symbol text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('BHAKTI', 28, 23, { align: 'center' });
  doc.text('HUSADA', 28, 27, { align: 'center' });

  // Letterhead texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(config.provinceName, 115, 18, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`${config.agencyName}`, 115, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(config.agencyAddress, 115, 29, { align: 'center' });
  doc.text(`Email: ${config.agencyEmail}`, 115, 33, { align: 'center' });

  // Double horizontal rule (Garuda / Gov style)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(18, 37, 192, 37);
  doc.setLineWidth(0.2);
  doc.line(18, 38.2, 192, 38.2);

  // --- JUDUL SURAT ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('SURAT KETERANGAN PERSETUJUAN LAYANAN RUMAH SINGGAH PASIEN', 105, 47, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nomor: ${letter.letterNumber}`, 105, 52, { align: 'center' });

  // --- PEMBUKA ---
  doc.setFontSize(9.5);
  doc.text(
    'Berdasarkan hasil verifikasi administrasi dan kelayakan berkas rujukan medis fasilitas kesehatan, dengan ini',
    20,
    62
  );
  doc.text(
    'Kepala Dinas Kesehatan menerbitkan persetujuan fasilitasi akomodasi Rumah Singgah Pasien (RSP) kepada:',
    20,
    67
  );

  // --- DATA PASIEN & PENDAMPING ---
  const startY = 74;
  const col1 = 22;
  const col2 = 68;
  const lineH = 6;

  doc.setFont('helvetica', 'bold');
  doc.text('1. DATA PASIEN & RUJUKAN', 20, startY);

  doc.setFont('helvetica', 'normal');
  const details = [
    ['Nama Lengkap Pasien', `: ${app.patient?.fullName || '-'}`],
    ['Nomor Induk Kependudukan (NIK)', `: ${maskNikForLetter(app.patient?.nik || '')}`],
    ['Tempat, Tanggal Lahir', `: ${app.patient?.birthPlace || '-'}, ${app.patient?.birthDate || '-'}`],
    ['Alamat Domisili Asal', `: ${app.patient?.address || '-'}`],
    ['Nomor Telepon/HP', `: ${app.patient?.phone || '-'}`],
    ['Faskes Rumah Sakit Rujukan', `: ${app.destinationHospital}`],
    ['Nomor Surat Rujukan RS', `: ${app.referralLetterNumber}`],
    ['Jadwal Kontrol / Pengobatan', `: ${app.appointmentDate}`],
  ];

  details.forEach(([label, value], idx) => {
    const y = startY + 6 + idx * lineH;
    doc.setFont('helvetica', 'normal');
    doc.text(label, col1, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, col2, y);
  });

  // Data Pendamping
  const companionY = startY + 6 + details.length * lineH + 3;
  doc.setFont('helvetica', 'bold');
  doc.text('2. DATA PENDAMPING', 20, companionY);

  doc.setFont('helvetica', 'normal');
  const compDetails = [
    ['Status Pendamping', `: ${app.companion?.hasCompanion ? 'Ada Pendamping Pasien' : 'Tidak Ada Pendamping'}`],
    ['Nama Pendamping', `: ${app.companion?.fullName || '-'}`],
    ['Hubungan Keluarga', `: ${app.companion?.relationship || '-'}`],
    ['Kebutuhan Bed Pendamping', `: ${app.companion?.needsAccommodation ? 'Fasilitasi Bed Pendamping' : 'Tidak Perlu'}`],
  ];

  compDetails.forEach(([label, value], idx) => {
    const y = companionY + 6 + idx * lineH;
    doc.setFont('helvetica', 'normal');
    doc.text(label, col1, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, col2, y);
  });

  // Ketentuan Pelayanan
  const termsY = companionY + 6 + compDetails.length * lineH + 3;
  doc.setFont('helvetica', 'bold');
  doc.text('3. KETENTUAN ALOKASI & TATA TERTIB RUMAH SINGGAH', 20, termsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const terms = [
    `a. Izin tinggal diberikan terhitung rencana check-in tanggal ${app.plannedCheckInDate} untuk durasi maksimal ${app.estimatedStayDays} hari.`,
    'b. Penerima manfaat wajib mematuhi seluruh tata tertib, kebersihan, dan jam besuk yang berlaku di Rumah Singgah Pasien.',
    'c. Fasilitas akomodasi disediakan secara GRATIS bagi pasien kurang mampu / rujukan medis yang memenuhi kriteria.',
    'd. Surat ini merupakan bukti sah untuk registrasi check-in dan serah terima kamar kepada Petugas Pengelola RSP.',
  ];

  terms.forEach((term, idx) => {
    doc.text(term, 22, termsY + 6 + idx * 5);
  });

  // --- FOOTER & TTE (TANDA TANGAN ELEKTRONIK) ---
  const signY = 208;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ditetapkan di : ${config.cityName}`, 125, signY);
  doc.text(`Pada tanggal  : ${formatIndonesianDate(letter.letterDate)}`, 125, signY + 5);
  doc.setFont('helvetica', 'bold');
  doc.text(config.directorPosition, 125, signY + 10);
  doc.text(config.agencyName, 125, signY + 14);

  // Embed verified QR Code
  doc.addImage(qrDataUrl, 'PNG', 135, signY + 16, 26, 26);

  // E-Sign badge beside QR code
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 58, 138);
  doc.text('Ditandatangani secara elektronik oleh:', 125, signY + 45);
  doc.setFont('helvetica', 'bold');
  doc.text(letter.signerName, 125, signY + 49);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${letter.signerNip}`, 125, signY + 53);

  // BSrE BSSN Verification Stamp Box
  doc.setDrawColor(37, 99, 235);
  doc.setFillColor(248, 250, 252);
  doc.rect(20, signY + 15, 95, 38, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('SERTIFIKAT ELEKTRONIK TERVERIFIKASI (BSrE - BSSN)', 23, signY + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('Dokumen ini sah dan telah ditandatangani menggunakan sertifikat elektronik', 23, signY + 26);
  doc.text('yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), Badan Siber dan', 23, signY + 30);
  doc.text('Sandi Negara (BSSN) sesuai dengan UU ITE No. 11/2008 & Perpres No. 95/2018.', 23, signY + 34);
  doc.text(`Doc SHA-256 : ${letter.documentHash.substring(0, 32)}...`, 23, signY + 40);
  doc.text(`Token Validasi: ${letter.verificationToken}`, 23, signY + 44);
  doc.text(`Pindai QR Code untuk memvalidasi keaslian dokumen resmi ini.`, 23, signY + 48);

  const pdfBlob = doc.output('blob');
  const pdfDataUrl = doc.output('dataurlstring');

  return { pdfBlob, pdfDataUrl, qrDataUrl };
}

function maskNikForLetter(nik: string): string {
  if (nik.length < 16) return nik;
  return `${nik.substring(0, 6)}******${nik.substring(12)}`;
}

function formatIndonesianDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
