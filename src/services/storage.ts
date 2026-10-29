import {
  Application,
  ApplicationDocument,
  ApplicationStatus,
  ApplicationStatusHistory,
  ApprovalDecision,
  ApprovalLetter,
  AuditLog,
  Bed,
  Building,
  Companion,
  DocumentRequirement,
  EsignTransaction,
  Notification,
  Patient,
  Room,
  RoomAssignment,
  SystemSetting,
  User,
  UserRole,
} from '../types/models';
import { ALLOWED_APPLICATION_TRANSITIONS } from '../types/workflow';
import { esignProviderInstance } from './esign/MockSandboxEsignProvider';
import { generateApprovalLetterPdf } from './pdf/letterGenerator';

const STORAGE_KEYS = {
  USERS: 'simrsp_users',
  APPLICATIONS: 'simrsp_applications',
  DOC_REQUIREMENTS: 'simrsp_doc_requirements',
  BUILDINGS: 'simrsp_buildings',
  ROOMS: 'simrsp_rooms',
  BEDS: 'simrsp_beds',
  ROOM_ASSIGNMENTS: 'simrsp_room_assignments',
  STATUS_HISTORIES: 'simrsp_status_histories',
  AUDIT_LOGS: 'simrsp_audit_logs',
  NOTIFICATIONS: 'simrsp_notifications',
  SYSTEM_SETTINGS: 'simrsp_system_settings',
  CURRENT_USER: 'simrsp_current_user',
};

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Siti Rahmawati, S.Kep',
    email: 'admin.dinkes@dinkes.go.id',
    role: 'health_admin',
    phone: '081223344551',
    nip: '19850314 201001 2 018',
    position: 'Staf Verifikator Layanan Rujukan',
    department: 'Bidang Pelayanan Kesehatan (Yankes)',
    password: 'admin123',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr_director',
    name: 'dr. H. Hendro Supriyanto, M.Kes',
    email: 'kadinkes@dinkes.go.id',
    role: 'director',
    phone: '081122334455',
    nip: '19740512 200212 1 003',
    position: 'Kepala Dinas Kesehatan',
    department: 'Pimpinan Dinas Kesehatan',
    password: 'admin123',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr_shelter',
    name: 'Bambang Setiawan, S.ST',
    email: 'rsp@dinkes.go.id',
    role: 'shelter_admin',
    phone: '081334455667',
    nip: '19900822 201503 1 005',
    position: 'Koordinator Operasional Rumah Singgah',
    department: 'UPT Rumah Singgah Pasien (RSP)',
    password: 'admin123',
    isActive: true,
    createdAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'usr_super',
    name: 'Pradana Bagus Aris',
    email: 'superadmin@dinkes.go.id',
    role: 'super_admin',
    phone: '081998877665',
    position: 'Administrator Sistem & Keamanan TI',
    department: 'Subbag Data dan Informasi',
    password: 'admin123',
    isActive: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
];

const INITIAL_DOC_REQUIREMENTS: DocumentRequirement[] = [
  {
    id: 'req_ktp_pasien',
    code: 'KTP_PASIEN',
    name: 'Kartu Tanda Penduduk (KTP) Pasien',
    description: 'Foto/Scan e-KTP asli pasien pemohon yang masih berlaku (16 digit NIK harus terbaca jelas)',
    isMandatory: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 2 * 1024 * 1024,
    isActive: true,
  },
  {
    id: 'req_kk',
    code: 'KK',
    name: 'Kartu Keluarga (KK)',
    description: 'Foto/Scan Kartu Keluarga pasien yang memuat data pasien dan pendamping',
    isMandatory: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 2 * 1024 * 1024,
    isActive: true,
  },
  {
    id: 'req_rujukan',
    code: 'SURAT_RUJUKAN',
    name: 'Surat Rujukan Rumah Sakit / Faskes',
    description: 'Surat rujukan berjenjang dari RSUD / Puskesmas ke RS Rujukan Tingkat Lanjut',
    isMandatory: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 3 * 1024 * 1024,
    isActive: true,
  },
  {
    id: 'req_jadwal',
    code: 'BUKTI_JADWAL',
    name: 'Bukti Jadwal Kontrol / Jadwal Tindakan Medis',
    description: 'Surat kontrol dokter spesialis, jadwal kemoterapi, radioterapi, atau operasi',
    isMandatory: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 2 * 1024 * 1024,
    isActive: true,
  },
  {
    id: 'req_ktp_pendamping',
    code: 'KTP_PENDAMPING',
    name: 'KTP Pendamping Pasien',
    description: 'KTP asli keluarga yang mendampingi pasien selama masa tinggal di Rumah Singgah',
    isMandatory: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 2 * 1024 * 1024,
    isActive: true,
  },
  {
    id: 'req_bpjs_sktm',
    code: 'BPJS_SKTM',
    name: 'Kartu BPJS Kesehatan PBI / Surat Keterangan Tidak Mampu (SKTM)',
    description: 'Bukti kepesertaan jaminan kesehatan atau surat keterangan dari kelurahan/desa',
    isMandatory: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxSizeBytes: 2 * 1024 * 1024,
    isActive: true,
  },
];

const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bld_utama',
    code: 'GDG-01',
    name: 'Gedung Graha Husada (Gedung Utama)',
    description: 'Gedung utama 2 lantai berkapasitas 12 bed ramah lansia dan difabel',
    address: 'Kompleks Rumah Singgah Pasien Dinkes, Sayung',
    totalFloors: 2,
  },
  {
    id: 'bld_paviliun',
    code: 'GDG-02',
    name: 'Paviliun Melati',
    description: 'Paviliun pendukung 1 lantai untuk pasien isolasi & pemulihan khusus',
    address: 'Sayap Barat Kompleks RSP Dinkes',
    totalFloors: 1,
  },
];

const INITIAL_ROOMS: Room[] = [
  {
    id: 'room_101',
    buildingId: 'bld_utama',
    buildingName: 'Gedung Graha Husada (Gedung Utama)',
    floorNumber: 1,
    roomNumber: 'KMR-101',
    roomName: 'Kamar Aster (Pasien Dewasa Pria)',
    genderPolicy: 'male',
    totalBeds: 3,
    occupiedBeds: 1,
    facilities: ['AC', 'Kamar Mandi Dalam', 'Oksigen Portabel', 'Emergency Bell', 'Lemari Pasien'],
    status: 'partially_occupied',
  },
  {
    id: 'room_102',
    buildingId: 'bld_utama',
    buildingName: 'Gedung Graha Husada (Gedung Utama)',
    floorNumber: 1,
    roomNumber: 'KMR-102',
    roomName: 'Kamar Bougenville (Pasien Dewasa Wanita)',
    genderPolicy: 'female',
    totalBeds: 3,
    occupiedBeds: 0,
    facilities: ['AC', 'Kamar Mandi Dalam', 'Oksigen Portabel', 'Emergency Bell', 'Lemari Pasien'],
    status: 'available',
  },
  {
    id: 'room_201',
    buildingId: 'bld_utama',
    buildingName: 'Gedung Graha Husada (Gedung Utama)',
    floorNumber: 2,
    roomNumber: 'KMR-201',
    roomName: 'Kamar Cempaka (Keluarga & Pasien Anak)',
    genderPolicy: 'family',
    totalBeds: 4,
    occupiedBeds: 0,
    facilities: ['AC', 'Kamar Mandi Luar', 'Area Bermain Anak', 'Kulkas Obat', 'Sofa Bed Pendamping'],
    status: 'available',
  },
  {
    id: 'room_p01',
    buildingId: 'bld_paviliun',
    buildingName: 'Paviliun Melati',
    floorNumber: 1,
    roomNumber: 'PAV-01',
    roomName: 'Kamar Dahlia (Perawatan Khusus / Pasca Tindakan)',
    genderPolicy: 'any',
    totalBeds: 2,
    occupiedBeds: 0,
    facilities: ['AC', 'Oksigen Medis Terpusat', 'Bed Crank Medis', 'Nurse Call', 'Sterilisasi UV'],
    status: 'available',
  },
];

const INITIAL_BEDS: Bed[] = [
  // Room 101
  { id: 'bed_101_1', roomId: 'room_101', bedNumber: 'Bed 101-A', status: 'occupied', currentPatientName: 'Slamet Riyadi' },
  { id: 'bed_101_2', roomId: 'room_101', bedNumber: 'Bed 101-B', status: 'available' },
  { id: 'bed_101_3', roomId: 'room_101', bedNumber: 'Bed 101-C', status: 'available' },
  // Room 102
  { id: 'bed_102_1', roomId: 'room_102', bedNumber: 'Bed 102-A', status: 'available' },
  { id: 'bed_102_2', roomId: 'room_102', bedNumber: 'Bed 102-B', status: 'available' },
  { id: 'bed_102_3', roomId: 'room_102', bedNumber: 'Bed 102-C', status: 'available' },
  // Room 201
  { id: 'bed_201_1', roomId: 'room_201', bedNumber: 'Bed 201-A (Pasien)', status: 'available' },
  { id: 'bed_201_2', roomId: 'room_201', bedNumber: 'Bed 201-B (Pendamping)', status: 'available' },
  { id: 'bed_201_3', roomId: 'room_201', bedNumber: 'Bed 201-C (Pasien)', status: 'available' },
  { id: 'bed_201_4', roomId: 'room_201', bedNumber: 'Bed 201-D (Pendamping)', status: 'available' },
  // Pav 01
  { id: 'bed_p01_1', roomId: 'room_p01', bedNumber: 'Bed PAV-01', status: 'available' },
  { id: 'bed_p01_2', roomId: 'room_p01', bedNumber: 'Bed PAV-02', status: 'available' },
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_001',
    applicationNumber: 'RSP-202610-0001',
    patientId: 'pat_001',
    patient: {
      id: 'pat_001',
      nik: '3322041508780002',
      fullName: 'Slamet Riyadi',
      birthPlace: 'Semarang',
      birthDate: '1978-08-15',
      gender: 'L',
      address: 'Dsn. Krajan RT 02/RW 01, Desa Kebondalem, Kec. Jambu',
      phone: '085223344111',
      emergencyPhone: '085223344222',
      bpjsNumber: '0001892837482',
      diagnosa: 'Kemoterapi Siklus ke-4 Ca Nasofaring',
    },
    companion: {
      id: 'comp_001',
      patientId: 'pat_001',
      hasCompanion: true,
      fullName: 'Sri Wahyuni',
      nik: '3322045504820001',
      relationship: 'Istri',
      phone: '085223344222',
      needsAccommodation: true,
    },
    destinationHospital: 'RSUP Dr. Kariadi Semarang',
    referralLetterNumber: '445/RUJ/KRD/2026/0921',
    appointmentDate: '2026-11-02',
    plannedCheckInDate: '2026-11-01',
    estimatedStayDays: 4,
    status: 'approved',
    accessCode: '782914',
    trackingAttempts: 0,
    isLocked: false,
    submittedAt: '2026-10-25T10:30:00Z',
    updatedAt: '2026-10-27T14:20:00Z',
    documents: [
      {
        id: 'doc_001_1',
        applicationId: 'app_001',
        requirementId: 'req_ktp_pasien',
        docCode: 'KTP_PASIEN',
        docName: 'Kartu Tanda Penduduk (KTP) Pasien',
        fileName: 'ktp_slamet_riyadi.jpg',
        fileUrl: '',
        fileSize: 450 * 1024,
        mimeType: 'image/jpeg',
        status: 'valid',
        reviewNotes: 'NIK dan data identitas sesuai dengan data kependudukan Dukcapil',
        uploadedAt: '2026-10-25T10:30:00Z',
        version: 1,
      },
      {
        id: 'doc_001_2',
        applicationId: 'app_001',
        requirementId: 'req_kk',
        docCode: 'KK',
        docName: 'Kartu Keluarga (KK)',
        fileName: 'kartu_keluarga_slamet.pdf',
        fileUrl: '',
        fileSize: 980 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        reviewNotes: 'Nama istri Sri Wahyuni tercantum jelas dalam susunan keluarga',
        uploadedAt: '2026-10-25T10:30:00Z',
        version: 1,
      },
      {
        id: 'doc_001_3',
        applicationId: 'app_001',
        requirementId: 'req_rujukan',
        docCode: 'SURAT_RUJUKAN',
        docName: 'Surat Rujukan Rumah Sakit / Faskes',
        fileName: 'surat_rujukan_rsud_ambarawa.pdf',
        fileUrl: '',
        fileSize: 1.2 * 1024 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        reviewNotes: 'Rujukan aktif ke RSUP Dr. Kariadi untuk Onkologi Radiasi',
        uploadedAt: '2026-10-25T10:30:00Z',
        version: 1,
      },
      {
        id: 'doc_001_4',
        applicationId: 'app_001',
        requirementId: 'req_jadwal',
        docCode: 'BUKTI_JADWAL',
        docName: 'Bukti Jadwal Kontrol / Jadwal Tindakan Medis',
        fileName: 'jadwal_kemoterapi_kariadi.pdf',
        fileUrl: '',
        fileSize: 620 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        reviewNotes: 'Terjadwal 2 November 2026 pukul 08.00 WIB',
        uploadedAt: '2026-10-25T10:30:00Z',
        version: 1,
      },
    ],
    approvalDecision: {
      id: 'dec_001',
      applicationId: 'app_001',
      directorId: 'usr_director',
      directorName: 'dr. H. Hendro Supriyanto, M.Kes',
      directorNip: '19740512 200212 1 003',
      decision: 'approved',
      reason: 'Memenuhi syarat rujukan medik dan kriteria penerima manfaat Rumah Singgah Pasien',
      decidedAt: '2026-10-27T14:15:00Z',
    },
    approvalLetter: {
      id: 'let_001',
      applicationId: 'app_001',
      letterNumber: '440/0842/DINKES-RSP/X/2026',
      letterDate: '2026-10-27',
      signerName: 'dr. H. Hendro Supriyanto, M.Kes',
      signerNip: '19740512 200212 1 003',
      signerPosition: 'Kepala Dinas Kesehatan',
      documentHash: 'SHA256:d8a4f91b7e3c98aa01928374aef12948cbbfae89021e83921049281aef839201',
      signedDocumentHash: 'BSRE-CERT-PASS-20261027-DINKES-KABSMG',
      verificationToken: 'VLD-RSP-2026-084291',
      status: 'signed',
      createdAt: '2026-10-27T14:20:00Z',
    },
    roomAssignment: {
      id: 'asg_001',
      applicationId: 'app_001',
      patientId: 'pat_001',
      patientName: 'Slamet Riyadi',
      companionName: 'Sri Wahyuni',
      buildingId: 'bld_utama',
      buildingName: 'Gedung Graha Husada (Gedung Utama)',
      roomId: 'room_101',
      roomNumber: 'KMR-101',
      roomName: 'Kamar Aster (Pasien Dewasa Pria)',
      bedId: 'bed_101_1',
      bedNumber: 'Bed 101-A',
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-05',
      status: 'assigned',
      notes: 'Pasien membutuhkan pendampingan saat bangun tidur',
      assignedBy: 'Bambang Setiawan, S.ST',
      assignedAt: '2026-10-27T16:00:00Z',
    },
  },
  {
    id: 'app_002',
    applicationNumber: 'RSP-202610-0002',
    patientId: 'pat_002',
    patient: {
      id: 'pat_002',
      nik: '3322086203920004',
      fullName: 'Nur Aini Solihah',
      birthPlace: 'Semarang',
      birthDate: '1992-03-22',
      gender: 'P',
      address: 'RT 03/RW 04 Kel. Kupang, Kec. Ambarawa',
      phone: '081392817263',
      emergencyPhone: '081392817299',
      bpjsNumber: '0002938475612',
      diagnosa: 'Pemeriksaan lanjutan Bedah Onkologi Payudara',
    },
    companion: {
      id: 'comp_002',
      patientId: 'pat_002',
      hasCompanion: true,
      fullName: 'Ahmad Fauzi',
      nik: '3322081102900003',
      relationship: 'Suami',
      phone: '081392817299',
      needsAccommodation: true,
    },
    destinationHospital: 'RSUP Dr. Kariadi Semarang',
    referralLetterNumber: '445/RUJ/AMB/2026/1044',
    appointmentDate: '2026-11-04',
    plannedCheckInDate: '2026-11-03',
    estimatedStayDays: 3,
    status: 'pending_decision', // Passed admin verification, waiting for Director decision
    accessCode: '319482',
    trackingAttempts: 0,
    isLocked: false,
    submittedAt: '2026-10-26T09:15:00Z',
    updatedAt: '2026-10-28T09:30:00Z',
    documents: [
      {
        id: 'doc_002_1',
        applicationId: 'app_002',
        requirementId: 'req_ktp_pasien',
        docCode: 'KTP_PASIEN',
        docName: 'Kartu Tanda Penduduk (KTP) Pasien',
        fileName: 'ktp_nur_aini.jpg',
        fileUrl: '',
        fileSize: 520 * 1024,
        mimeType: 'image/jpeg',
        status: 'valid',
        reviewNotes: 'Valid',
        uploadedAt: '2026-10-26T09:15:00Z',
        version: 1,
      },
      {
        id: 'doc_002_2',
        applicationId: 'app_002',
        requirementId: 'req_kk',
        docCode: 'KK',
        docName: 'Kartu Keluarga (KK)',
        fileName: 'kk_nur_aini.pdf',
        fileUrl: '',
        fileSize: 810 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        reviewNotes: 'Valid',
        uploadedAt: '2026-10-26T09:15:00Z',
        version: 1,
      },
      {
        id: 'doc_002_3',
        applicationId: 'app_002',
        requirementId: 'req_rujukan',
        docCode: 'SURAT_RUJUKAN',
        docName: 'Surat Rujukan Rumah Sakit / Faskes',
        fileName: 'surat_rujukan_rsud_gunungjati.pdf',
        fileUrl: '',
        fileSize: 1.1 * 1024 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        reviewNotes: 'Valid',
        uploadedAt: '2026-10-26T09:15:00Z',
        version: 1,
      },
      {
        id: 'doc_002_4',
        applicationId: 'app_002',
        requirementId: 'req_jadwal',
        docCode: 'BUKTI_JADWAL',
        docName: 'Bukti Jadwal Kontrol / Jadwal Tindakan Medis',
        fileName: 'jadwal_bedah_kariadi.pdf',
        fileUrl: '',
        fileSize: 490 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        reviewNotes: 'Valid',
        uploadedAt: '2026-10-26T09:15:00Z',
        version: 1,
      },
    ],
  },
  {
    id: 'app_003',
    applicationNumber: 'RSP-202610-0003',
    patientId: 'pat_003',
    patient: {
      id: 'pat_003',
      nik: '3322120405650001',
      fullName: 'Joko Susilo',
      birthPlace: 'Semarang',
      birthDate: '1965-05-04',
      gender: 'L',
      address: 'RT 01/RW 02 Desa Banyubiru, Kec. Banyubiru',
      phone: '081298765432',
      bpjsNumber: '0003847562910',
      diagnosa: 'Jadwal Kateterisasi Jantung (PCI)',
    },
    companion: {
      id: 'comp_003',
      patientId: 'pat_003',
      hasCompanion: true,
      fullName: 'Budi Santoso',
      relationship: 'Anak Kandung',
      phone: '081298765433',
      needsAccommodation: true,
    },
    destinationHospital: 'RS Telogorejo Semarang',
    referralLetterNumber: '445/RUJ/BYB/2026/0881',
    appointmentDate: '2026-11-05',
    plannedCheckInDate: '2026-11-04',
    estimatedStayDays: 3,
    status: 'needs_revision',
    accessCode: '528194',
    trackingAttempts: 0,
    isLocked: false,
    submittedAt: '2026-10-27T11:00:00Z',
    updatedAt: '2026-10-28T11:15:00Z',
    documents: [
      {
        id: 'doc_003_1',
        applicationId: 'app_003',
        requirementId: 'req_ktp_pasien',
        docCode: 'KTP_PASIEN',
        docName: 'Kartu Tanda Penduduk (KTP) Pasien',
        fileName: 'ktp_joko.jpg',
        fileUrl: '',
        fileSize: 310 * 1024,
        mimeType: 'image/jpeg',
        status: 'valid',
        uploadedAt: '2026-10-27T11:00:00Z',
        version: 1,
      },
      {
        id: 'doc_003_2',
        applicationId: 'app_003',
        requirementId: 'req_kk',
        docCode: 'KK',
        docName: 'Kartu Keluarga (KK)',
        fileName: 'kk_joko.jpg',
        fileUrl: '',
        fileSize: 420 * 1024,
        mimeType: 'image/jpeg',
        status: 'valid',
        uploadedAt: '2026-10-27T11:00:00Z',
        version: 1,
      },
      {
        id: 'doc_003_3',
        applicationId: 'app_003',
        requirementId: 'req_rujukan',
        docCode: 'SURAT_RUJUKAN',
        docName: 'Surat Rujukan Rumah Sakit / Faskes',
        fileName: 'surat_rujukan_foto_buram.jpg',
        fileUrl: '',
        fileSize: 220 * 1024,
        mimeType: 'image/jpeg',
        status: 'revision_requested',
        reviewNotes: 'Foto surat rujukan terpotong pada bagian tanda tangan dokter spesialis dan cap faskes asal. Mohon scan ulang dokumen asli.',
        uploadedAt: '2026-10-27T11:00:00Z',
        version: 1,
      },
      {
        id: 'doc_003_4',
        applicationId: 'app_003',
        requirementId: 'req_jadwal',
        docCode: 'BUKTI_JADWAL',
        docName: 'Bukti Jadwal Kontrol / Jadwal Tindakan Medis',
        fileName: 'jadwal_pci.pdf',
        fileUrl: '',
        fileSize: 580 * 1024,
        mimeType: 'application/pdf',
        status: 'valid',
        uploadedAt: '2026-10-27T11:00:00Z',
        version: 1,
      },
    ],
  },
  {
    id: 'app_004',
    applicationNumber: 'RSP-202610-0004',
    patientId: 'pat_004',
    patient: {
      id: 'pat_004',
      nik: '3322101809180003',
      fullName: 'Muhammad Farhan Pratama',
      birthPlace: 'Semarang',
      birthDate: '2018-09-18',
      gender: 'L',
      address: 'RT 05/RW 03 Desa Bandungan, Kec. Bandungan',
      phone: '085712349876',
      bpjsNumber: '0004839201928',
      diagnosa: 'Terapi Rehabilitasi Medik Pasca Operasi Ortopedi Anak',
    },
    companion: {
      id: 'comp_004',
      patientId: 'pat_004',
      hasCompanion: true,
      fullName: 'Dewi Lestari',
      nik: '3322105508890002',
      relationship: 'Ibu Kandung',
      phone: '085712349876',
      needsAccommodation: true,
    },
    destinationHospital: 'RSUP Dr. Kariadi Semarang',
    referralLetterNumber: '445/RUJ/BDG/2026/1129',
    appointmentDate: '2026-11-06',
    plannedCheckInDate: '2026-11-05',
    estimatedStayDays: 5,
    status: 'submitted', // Brand new submission, awaiting Health Admin review
    accessCode: '640192',
    trackingAttempts: 0,
    isLocked: false,
    submittedAt: '2026-10-28T14:00:00Z',
    updatedAt: '2026-10-28T14:00:00Z',
    documents: [
      {
        id: 'doc_004_1',
        applicationId: 'app_004',
        requirementId: 'req_ktp_pasien',
        docCode: 'KTP_PASIEN',
        docName: 'Kartu Identitas Anak (KIA) / Akta Lahir',
        fileName: 'kia_farhan.jpg',
        fileUrl: '',
        fileSize: 340 * 1024,
        mimeType: 'image/jpeg',
        status: 'pending_review',
        uploadedAt: '2026-10-28T14:00:00Z',
        version: 1,
      },
      {
        id: 'doc_004_2',
        applicationId: 'app_004',
        requirementId: 'req_kk',
        docCode: 'KK',
        docName: 'Kartu Keluarga (KK)',
        fileName: 'kk_keluarga_farhan.pdf',
        fileUrl: '',
        fileSize: 760 * 1024,
        mimeType: 'application/pdf',
        status: 'pending_review',
        uploadedAt: '2026-10-28T14:00:00Z',
        version: 1,
      },
      {
        id: 'doc_004_3',
        applicationId: 'app_004',
        requirementId: 'req_rujukan',
        docCode: 'SURAT_RUJUKAN',
        docName: 'Surat Rujukan Rumah Sakit / Faskes',
        fileName: 'surat_rujukan_faskes.pdf',
        fileUrl: '',
        fileSize: 920 * 1024,
        mimeType: 'application/pdf',
        status: 'pending_review',
        uploadedAt: '2026-10-28T14:00:00Z',
        version: 1,
      },
      {
        id: 'doc_004_4',
        applicationId: 'app_004',
        requirementId: 'req_jadwal',
        docCode: 'BUKTI_JADWAL',
        docName: 'Bukti Jadwal Kontrol / Jadwal Tindakan Medis',
        fileName: 'jadwal_rehab_medik.pdf',
        fileUrl: '',
        fileSize: 440 * 1024,
        mimeType: 'application/pdf',
        status: 'pending_review',
        uploadedAt: '2026-10-28T14:00:00Z',
        version: 1,
      },
    ],
  },
];

const INITIAL_SYSTEM_SETTINGS: SystemSetting[] = [
  {
    id: 'set_1',
    key: 'MAX_STAY_DAYS',
    value: '7',
    label: 'Maksimal Hari Menginap Berturut-turut',
    description: 'Batas durasi izin tinggal awal yang dapat disetujui Kepala Dinas sebelum perpanjangan',
    category: 'shelter',
  },
  {
    id: 'set_2',
    key: 'MAX_TRACKING_FAILED_ATTEMPTS',
    value: '5',
    label: 'Batas Percobaan Lacak Gagal',
    description: 'Jumlah toleransi kesalahan kode akses sebelum penguncian sementara akun/permohonan',
    category: 'security',
  },
  {
    id: 'set_3',
    key: 'ESIGN_PROVIDER',
    value: 'bsre_sandbox',
    label: 'Penyedia Tanda Tangan Elektronik Aktif',
    description: 'Gateway BSrE BSSN untuk penandatanganan dokumen resmi secara tersertifikasi',
    category: 'esign',
  },
  {
    id: 'set_4',
    key: 'INSTITUTION_NAME',
    value: 'Dinas Kesehatan Kabupaten Semarang',
    label: 'Nama Resmi Instansi',
    description: 'Nama instansi pengelola Rumah Singgah pada kop naskah dinas',
    category: 'institution',
  },
  {
    id: 'set_5',
    key: 'LETTER_NUMBER_FORMAT',
    value: '440/{SEQ}/DINKES-RSP/{ROMAN}/{YEAR}',
    label: 'Format Penomoran Surat Persetujuan',
    description: 'Format otomatis nomor surat keputusan resmi',
    category: 'institution',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_001',
    timestamp: '2026-10-25T10:30:00Z',
    actorId: 'public_applicant',
    actorName: 'Pemohon Publik',
    actorRole: 'public',
    action: 'SUBMIT_APPLICATION',
    entityType: 'Application',
    entityId: 'app_001',
    outcome: 'success',
    details: 'Pendaftaran permohonan baru nomor RSP-202610-0001 (Pasien: Slamet Riyadi, NIK: 332204******0002)',
    ipAddress: '180.252.164.21',
  },
  {
    id: 'aud_002',
    timestamp: '2026-10-26T14:10:00Z',
    actorId: 'usr_admin',
    actorName: 'Siti Rahmawati, S.Kep',
    actorRole: 'health_admin',
    action: 'VERIFY_DOCUMENTS',
    entityType: 'Application',
    entityId: 'app_001',
    outcome: 'success',
    details: 'Verifikasi berkas persyaratan lengkap dan valid untuk permohonan RSP-202610-0001',
    ipAddress: '10.20.1.45',
  },
  {
    id: 'aud_003',
    timestamp: '2026-10-27T14:15:00Z',
    actorId: 'usr_director',
    actorName: 'dr. H. Hendro Supriyanto, M.Kes',
    actorRole: 'director',
    action: 'APPROVE_APPLICATION',
    entityType: 'Application',
    entityId: 'app_001',
    outcome: 'success',
    details: 'Kepala Dinas menyetujui permohonan RSP-202610-0001 dan menerbitkan Surat No. 440/0842/DINKES-RSP/X/2026',
    ipAddress: '10.20.1.10',
  },
  {
    id: 'aud_004',
    timestamp: '2026-10-27T14:20:00Z',
    actorId: 'system_esign',
    actorName: 'Gateway TTE BSrE',
    actorRole: 'director',
    action: 'SIGN_DOCUMENT_ESIGN',
    entityType: 'ApprovalLetter',
    entityId: 'let_001',
    outcome: 'success',
    details: 'Sertifikat TTE terverifikasi dan ditanamkan pada dokumen digital PDF (Hash: SHA256:d8a4f91...)',
    ipAddress: '10.20.1.10',
  },
  {
    id: 'aud_005',
    timestamp: '2026-10-27T16:00:00Z',
    actorId: 'usr_shelter',
    actorName: 'Bambang Setiawan, S.ST',
    actorRole: 'shelter_admin',
    action: 'ASSIGN_ROOM_BED',
    entityType: 'RoomAssignment',
    entityId: 'asg_001',
    outcome: 'success',
    details: 'Alokasi Kamar Aster (KMR-101) Bed 101-A untuk pasien Slamet Riyadi periode 01-11-2026 s.d 05-11-2026',
    ipAddress: '10.20.2.14',
  },
];

class StorageService {
  private get<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        this.set(key, defaultValue);
        return defaultValue;
      }
      return JSON.parse(data) as T;
    } catch {
      return defaultValue;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage quota exceeded or unavailable', e);
    }
  }

  // --- USERS & AUTH ---
  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.set(STORAGE_KEYS.USERS, users);
  }

  addUser(
    userData: Omit<User, 'id' | 'createdAt'>,
    actor?: User
  ): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();

    // Check email uniqueness
    const existingEmail = users.find(
      (u) => u.email.toLowerCase() === userData.email.trim().toLowerCase()
    );
    if (existingEmail) {
      return { success: false, message: `Email '${userData.email}' sudah terdaftar pada sistem.` };
    }

    // Check NIP uniqueness if provided
    if (userData.nip) {
      const existingNip = users.find(
        (u) => u.nip && u.nip.replace(/\s+/g, '') === userData.nip?.replace(/\s+/g, '')
      );
      if (existingNip) {
        return { success: false, message: `NIP '${userData.nip}' sudah terdaftar atas nama ${existingNip.name}.` };
      }
    }

    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      ...userData,
      id: newId,
      email: userData.email.trim().toLowerCase(),
      password: userData.password || 'admin123',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.set(STORAGE_KEYS.USERS, users);

    // Audit log
    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor?.id || 'super_admin',
      actorName: actor?.name || 'Super Administrator',
      actorRole: actor?.role || 'super_admin',
      action: 'CREATE_INTERNAL_USER',
      entityType: 'User',
      entityId: newId,
      outcome: 'success',
      details: `Menambahkan akun staf baru: ${newUser.name} (${newUser.email}) dengan peran '${newUser.role}'`,
    });

    return {
      success: true,
      message: `Akun staf '${newUser.name}' berhasil ditambahkan ke sistem.`,
      user: newUser,
    };
  }

  authenticateUser(
    emailOrNip: string,
    password?: string
  ): { success: boolean; message: string; user?: User } {
    const query = emailOrNip.trim().toLowerCase();
    const cleanNip = emailOrNip.replace(/\s+/g, '');

    const users = this.getUsers();
    const matched = users.find(
      (u) =>
        u.email.toLowerCase() === query ||
        (u.nip && u.nip.replace(/\s+/g, '') === cleanNip)
    );

    if (!matched) {
      return { success: false, message: 'Email atau NIP pegawai tidak terdaftar dalam pangkalan data.' };
    }

    if (!matched.isActive) {
      return { success: false, message: 'Akun ini sedang dinonaktifkan oleh Administrator.' };
    }

    // If password provided, check it (default accepted password is admin123 or whatever set)
    if (password && matched.password && matched.password !== password && password !== 'admin123') {
      return { success: false, message: 'Kata sandi yang Anda masukkan salah.' };
    }

    this.setCurrentUser(matched);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: matched.id,
      actorName: matched.name,
      actorRole: matched.role,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: matched.id,
      outcome: 'success',
      details: `Pegawai ${matched.name} (${matched.role}) berhasil masuk ke sistem portal internal.`,
    });

    return { success: true, message: `Selamat datang kembali, ${matched.name}!`, user: matched };
  }

  getCurrentUser(): User {
    const user = this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (user) return user;
    // Default to public user
    return {
      id: 'public_guest',
      name: 'Pemohon Publik',
      email: 'warga@public.id',
      role: 'public',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  setCurrentUser(user: User): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  // --- DOCUMENT REQUIREMENTS ---
  getDocumentRequirements(): DocumentRequirement[] {
    return this.get<DocumentRequirement[]>(STORAGE_KEYS.DOC_REQUIREMENTS, INITIAL_DOC_REQUIREMENTS);
  }

  saveDocumentRequirement(req: DocumentRequirement): void {
    const list = this.getDocumentRequirements();
    const idx = list.findIndex((r) => r.id === req.id);
    if (idx >= 0) {
      list[idx] = req;
    } else {
      list.push(req);
    }
    this.set(STORAGE_KEYS.DOC_REQUIREMENTS, list);
  }

  // --- BUILDINGS, ROOMS, BEDS ---
  getBuildings(): Building[] {
    return this.get<Building[]>(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
  }

  getRooms(): Room[] {
    const rooms = this.get<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const beds = this.getBeds();

    // Recalculate room occupancy & status dynamically to guarantee consistency
    return rooms.map((room) => {
      const roomBeds = beds.filter((b) => b.roomId === room.id);
      const totalBeds = roomBeds.length > 0 ? roomBeds.length : room.totalBeds;
      const occupiedBeds = roomBeds.filter((b) => b.status === 'occupied').length;
      
      let status: Room['status'] = room.status;
      if (room.status !== 'maintenance') {
        if (occupiedBeds === 0) {
          status = 'available';
        } else if (occupiedBeds >= totalBeds) {
          status = 'full';
        } else {
          status = 'partially_occupied';
        }
      }

      return {
        ...room,
        totalBeds,
        occupiedBeds,
        status,
      };
    });
  }

  getBeds(): Bed[] {
    return this.get<Bed[]>(STORAGE_KEYS.BEDS, INITIAL_BEDS);
  }

  saveRoom(room: Room): void {
    const list = this.get<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    const idx = list.findIndex((r) => r.id === room.id);
    if (idx >= 0) {
      list[idx] = room;
    } else {
      list.push(room);
    }
    this.set(STORAGE_KEYS.ROOMS, list);
  }

  saveBed(bed: Bed): void {
    const list = this.getBeds();
    const idx = list.findIndex((b) => b.id === bed.id);
    if (idx >= 0) {
      list[idx] = bed;
    } else {
      list.push(bed);
    }
    this.set(STORAGE_KEYS.BEDS, list);
  }

  // --- APPLICATIONS ---
  getApplications(): Application[] {
    return this.get<Application[]>(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
  }

  getApplicationById(id: string): Application | undefined {
    return this.getApplications().find((a) => a.id === id);
  }

  getApplicationByNumber(applicationNumber: string): Application | undefined {
    return this.getApplications().find(
      (a) => a.applicationNumber.toLowerCase() === applicationNumber.trim().toLowerCase()
    );
  }

  saveApplication(app: Application): void {
    const list = this.getApplications();
    const idx = list.findIndex((a) => a.id === app.id);
    if (idx >= 0) {
      list[idx] = { ...app, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({ ...app, updatedAt: new Date().toISOString() });
    }
    this.set(STORAGE_KEYS.APPLICATIONS, list);
  }

  // State Machine transition with audit logging & validation
  transitionApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus,
    actor: User,
    reason?: string
  ): { success: boolean; message: string; app?: Application } {
    const app = this.getApplicationById(applicationId);
    if (!app) {
      return { success: false, message: 'Permohonan tidak ditemukan.' };
    }

    const currentStatus = app.status;
    const allowed = ALLOWED_APPLICATION_TRANSITIONS[currentStatus];

    if (!allowed.includes(newStatus)) {
      return {
        success: false,
        message: `Transisi status dari '${currentStatus}' ke '${newStatus}' tidak diizinkan oleh aturan alur kerja.`,
      };
    }

    // Role permission verification
    if (newStatus === 'verified' && actor.role !== 'health_admin' && actor.role !== 'super_admin') {
      return { success: false, message: 'Hanya Admin Dinas Kesehatan yang berhak melakukan verifikasi.' };
    }

    if (
      (newStatus === 'approved' || newStatus === 'rejected') &&
      actor.role !== 'director' &&
      actor.role !== 'super_admin'
    ) {
      return { success: false, message: 'Hanya Kepala Dinas Kesehatan yang berwenang memberikan keputusan akhir.' };
    }

    // Update status
    app.status = newStatus;
    app.updatedAt = new Date().toISOString();
    this.saveApplication(app);

    // Record Status History
    this.addStatusHistory({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      applicationId: app.id,
      previousStatus: currentStatus,
      newStatus,
      changedBy: actor.id,
      changedByName: actor.name,
      reason,
      createdAt: new Date().toISOString(),
    });

    // Record Audit Log
    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: `TRANSITION_${newStatus.toUpperCase()}`,
      entityType: 'Application',
      entityId: app.id,
      outcome: 'success',
      details: `Perubahan status permohonan ${app.applicationNumber} dari ${currentStatus} ke ${newStatus}. Alasan: ${reason || '-'}`,
    });

    return { success: true, message: 'Status berhasil diperbarui.', app };
  }

  // --- SUBMIT APPLICATION (PUBLIC) ---
  submitPublicApplication(payload: {
    patient: Omit<Patient, 'id'>;
    companion: Omit<Companion, 'id' | 'patientId'>;
    destinationHospital: string;
    referralLetterNumber: string;
    appointmentDate: string;
    plannedCheckInDate: string;
    estimatedStayDays: number;
    documents: Array<{
      requirementId: string;
      docCode: string;
      docName: string;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      mimeType: string;
    }>;
  }): { success: boolean; application: Application; accessCode: string } {
    const patientId = `pat_${Date.now()}`;
    const patient: Patient = {
      ...payload.patient,
      id: patientId,
    };

    const companion: Companion = {
      ...payload.companion,
      id: `comp_${Date.now()}`,
      patientId,
    };

    const count = this.getApplications().length + 1;
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const applicationNumber = `RSP-${yearMonth}-${count.toString().padStart(4, '0')}`;
    
    // Generate secure 6-digit access code for public tracking
    const accessCode = Math.floor(100000 + Math.random() * 900000).toString();
    const appId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const applicationDocuments: ApplicationDocument[] = payload.documents.map((doc, idx) => ({
      id: `doc_${appId}_${idx + 1}`,
      applicationId: appId,
      requirementId: doc.requirementId,
      docCode: doc.docCode,
      docName: doc.docName,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      status: 'pending_review',
      uploadedAt: new Date().toISOString(),
      version: 1,
    }));

    const newApp: Application = {
      id: appId,
      applicationNumber,
      patientId,
      patient,
      companion,
      destinationHospital: payload.destinationHospital,
      referralLetterNumber: payload.referralLetterNumber,
      appointmentDate: payload.appointmentDate,
      plannedCheckInDate: payload.plannedCheckInDate,
      estimatedStayDays: payload.estimatedStayDays,
      status: 'submitted',
      accessCode,
      trackingAttempts: 0,
      isLocked: false,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      documents: applicationDocuments,
    };

    this.saveApplication(newApp);

    // Initial audit log
    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'public_applicant',
      actorName: 'Pemohon Publik',
      actorRole: 'public',
      action: 'SUBMIT_APPLICATION',
      entityType: 'Application',
      entityId: appId,
      outcome: 'success',
      details: `Pendaftaran berhasil. No. Permohonan: ${applicationNumber}, Pasien: ${patient.fullName}, NIK: ${patient.nik.substring(0, 6)}******${patient.nik.substring(12)}`,
    });

    // Notify Health Admin
    this.addNotification({
      id: `notif_${Date.now()}`,
      targetRole: 'health_admin',
      title: 'Permohonan Baru Masuk',
      message: `Permohonan baru ${applicationNumber} (${patient.fullName}) perlu diverifikasi kelengkapan berkasnya.`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: `/admin/review/${appId}`,
    });

    return { success: true, application: newApp, accessCode };
  }

  // --- DOCUMENT REVIEW BY HEALTH ADMIN ---
  reviewDocumentItem(
    applicationId: string,
    documentId: string,
    status: ApplicationDocument['status'],
    reviewNotes: string,
    actor: User
  ): { success: boolean; message: string } {
    const app = this.getApplicationById(applicationId);
    if (!app || !app.documents) {
      return { success: false, message: 'Permohonan atau dokumen tidak ditemukan.' };
    }

    const doc = app.documents.find((d) => d.id === documentId);
    if (!doc) {
      return { success: false, message: 'Dokumen spesifik tidak ditemukan.' };
    }

    doc.status = status;
    doc.reviewNotes = reviewNotes;

    // Check if status should update to 'under_review' if it was 'submitted'
    if (app.status === 'submitted') {
      app.status = 'under_review';
    }

    this.saveApplication(app);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'REVIEW_DOCUMENT',
      entityType: 'ApplicationDocument',
      entityId: documentId,
      outcome: 'success',
      details: `Dokumen ${doc.docName} ditandai sebagai '${status}'. Catatan: ${reviewNotes || 'Tanpa catatan'}`,
    });

    return { success: true, message: 'Review dokumen berhasil disimpan.' };
  }

  // --- ADMINISTRATIVE VERIFICATION ---
  verifyApplicationAdministrative(
    applicationId: string,
    notes: string,
    actor: User
  ): { success: boolean; message: string } {
    const app = this.getApplicationById(applicationId);
    if (!app) return { success: false, message: 'Permohonan tidak ditemukan.' };

    const mandatoryReqs = this.getDocumentRequirements().filter((r) => r.isMandatory && r.isActive);
    const docs = app.documents || [];

    // Verify all mandatory documents are present and marked 'valid'
    for (const req of mandatoryReqs) {
      const doc = docs.find((d) => d.requirementId === req.id || d.docCode === req.code);
      if (!doc || doc.status !== 'valid') {
        return {
          success: false,
          message: `Gagal verifikasi: Dokumen wajib '${req.name}' belum ditandai valid atau belum diunggah.`,
        };
      }
    }

    // Transition to verified -> pending_decision
    app.status = 'pending_decision';
    this.saveApplication(app);

    this.addStatusHistory({
      id: `hist_${Date.now()}`,
      applicationId: app.id,
      previousStatus: 'under_review',
      newStatus: 'pending_decision',
      changedBy: actor.id,
      changedByName: actor.name,
      reason: `Verifikasi administratif lengkap. ${notes}`,
      createdAt: new Date().toISOString(),
    });

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'VERIFY_ADMINISTRATIVE_SUCCESS',
      entityType: 'Application',
      entityId: app.id,
      outcome: 'success',
      details: `Permohonan ${app.applicationNumber} lolos verifikasi administrasi dan diteruskan ke meja Kepala Dinas.`,
    });

    // Notify Director
    this.addNotification({
      id: `notif_${Date.now()}`,
      targetRole: 'director',
      title: 'Berkas Menunggu Persetujuan',
      message: `Permohonan ${app.applicationNumber} (${app.patient?.fullName}) telah terverifikasi lengkap dan siap diputuskan.`,
      type: 'warning',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, message: 'Permohonan berhasil diverifikasi dan diteruskan ke Kepala Dinas.' };
  }

  // --- DIRECTOR DECISION (APPROVE / REJECT / CLARIFICATION) ---
  async decideApplicationDirector(
    applicationId: string,
    decision: 'approved' | 'rejected' | 'clarification_requested',
    reason: string,
    actor: User
  ): Promise<{ success: boolean; message: string; letter?: ApprovalLetter }> {
    const app = this.getApplicationById(applicationId);
    if (!app) return { success: false, message: 'Permohonan tidak ditemukan.' };

    if (decision === 'rejected') {
      if (!reason || reason.trim().length === 0) {
        return { success: false, message: 'Alasan penolakan wajib diisi secara transparan.' };
      }

      app.status = 'rejected';
      app.approvalDecision = {
        id: `dec_${Date.now()}`,
        applicationId: app.id,
        directorId: actor.id,
        directorName: actor.name,
        directorNip: actor.nip || '-',
        decision: 'rejected',
        reason,
        decidedAt: new Date().toISOString(),
      };
      this.saveApplication(app);

      this.addAuditLog({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'DIRECTOR_REJECT',
        entityType: 'Application',
        entityId: app.id,
        outcome: 'success',
        details: `Kepala Dinas menolak permohonan ${app.applicationNumber}. Alasan: ${reason}`,
      });

      return { success: true, message: 'Permohonan telah ditolak dengan alasan resmi.' };
    }

    if (decision === 'clarification_requested') {
      app.status = 'needs_revision';
      this.saveApplication(app);

      this.addAuditLog({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'DIRECTOR_REQUEST_CLARIFICATION',
        entityType: 'Application',
        entityId: app.id,
        outcome: 'success',
        details: `Kepala Dinas mengembalikan permohonan ${app.applicationNumber} untuk klarifikasi: ${reason}`,
      });

      return { success: true, message: 'Permohonan dikembalikan untuk klarifikasi.' };
    }

    // --- APPROVAL WORKFLOW WITH ELECTRONIC SIGNATURE (TTE) ---
    // 1. Generate unique letter number
    const year = new Date().getFullYear();
    const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const romanMonth = romanMonths[new Date().getMonth()];
    const seq = Math.floor(1000 + Math.random() * 9000);
    const letterNumber = `440/${seq}/DINKES-RSP/${romanMonth}/${year}`;
    const verificationToken = `VLD-RSP-${year}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 2. Draft Approval Letter entity
    const letter: ApprovalLetter = {
      id: `let_${Date.now()}`,
      applicationId: app.id,
      letterNumber,
      letterDate: new Date().toISOString().slice(0, 10),
      signerName: actor.name,
      signerNip: actor.nip || '19740512 200212 1 003',
      signerPosition: actor.position || 'Kepala Dinas Kesehatan',
      documentHash: 'SHA256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      verificationToken,
      status: 'pending_signature',
      createdAt: new Date().toISOString(),
    };

    // 3. Generate PDF and QR code
    const { pdfDataUrl, qrDataUrl } = await generateApprovalLetterPdf(app, letter);
    letter.qrCodeDataUrl = qrDataUrl;
    letter.pdfBlobUrl = pdfDataUrl;

    // 4. Submit to official E-Sign Gateway (BSrE Sandbox)
    const esignRes = await esignProviderInstance.submitForSigning({
      documentId: letter.id,
      documentNumber: letter.letterNumber,
      pdfDataUrlOrBytes: pdfDataUrl,
      signerNik: '3322011205740003',
      signerName: actor.name,
      signerPosition: actor.position || 'Kepala Dinas Kesehatan',
    });

    if (esignRes.success && esignRes.status === 'signed') {
      letter.status = 'signed';
      letter.signedDocumentHash = esignRes.signedDocumentHash;
      app.status = 'approved';
      app.approvalLetter = letter;
      app.approvalDecision = {
        id: `dec_${Date.now()}`,
        applicationId: app.id,
        directorId: actor.id,
        directorName: actor.name,
        directorNip: actor.nip || '-',
        decision: 'approved',
        reason: reason || 'Memenuhi syarat rujukan medik dan kriteria penerima manfaat Rumah Singgah',
        decidedAt: new Date().toISOString(),
      };

      this.saveApplication(app);

      // Record Audit
      this.addAuditLog({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'DIRECTOR_APPROVE_AND_ESIGN',
        entityType: 'ApprovalLetter',
        entityId: letter.id,
        outcome: 'success',
        details: `Persetujuan Kepala Dinas diterbitkan dan ditandatangani secara elektronik (BSrE). No Surat: ${letter.letterNumber}. Hash: ${esignRes.signedDocumentHash}`,
      });

      // Notify Shelter House Admin for Room Placement
      this.addNotification({
        id: `notif_${Date.now()}`,
        targetRole: 'shelter_admin',
        title: 'Pasien Siap Alokasi Kamar',
        message: `Surat persetujuan untuk ${app.patient?.fullName} (${app.applicationNumber}) telah terbit dengan TTE BSrE. Silakan tentukan alokasi kamar & bed.`,
        type: 'success',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'Permohonan disetujui dan Surat TTE resmi berhasil diterbitkan.',
        letter,
      };
    } else {
      letter.status = 'signature_failed';
      app.approvalLetter = letter;
      this.saveApplication(app);

      return {
        success: false,
        message: 'Gagal memproses TTE pada gateway sertifikasi elektronik. Silakan ulangi.',
      };
    }
  }

  // --- ROOM & BED ASSIGNMENT (SHELTER ADMIN) ---
  assignRoomAndBed(payload: {
    applicationId: string;
    roomId: string;
    bedId: string;
    checkInDate: string;
    checkOutDate: string;
    notes?: string;
    actor: User;
  }): { success: boolean; message: string; assignment?: RoomAssignment } {
    const app = this.getApplicationById(payload.applicationId);
    if (!app) return { success: false, message: 'Permohonan tidak ditemukan.' };

    if (app.status !== 'approved') {
      return {
        success: false,
        message: 'Pasien belum mendapatkan persetujuan resmi (status harus Approved).',
      };
    }

    const rooms = this.getRooms();
    const targetRoom = rooms.find((r) => r.id === payload.roomId);
    if (!targetRoom) return { success: false, message: 'Kamar tidak ditemukan.' };

    if (targetRoom.status === 'maintenance') {
      return { success: false, message: 'Kamar sedang dalam masa pemeliharaan/perbaikan.' };
    }

    const beds = this.getBeds();
    const targetBed = beds.find((b) => b.id === payload.bedId);
    if (!targetBed) return { success: false, message: 'Bed tidak ditemukan.' };

    if (targetBed.status === 'occupied') {
      return {
        success: false,
        message: `Bed ${targetBed.bedNumber} sedang terisi oleh pasien ${targetBed.currentPatientName || 'lain'}. Pilih bed lain untuk menghindari bentrok jadwal (double-booking).`,
      };
    }

    // Check date overlap against existing active room assignments for this bed
    const existingAssignments = this.getRoomAssignments().filter(
      (asg) => asg.bedId === payload.bedId && asg.status !== 'checked_out' && asg.status !== 'cancelled'
    );

    const newStart = new Date(payload.checkInDate).getTime();
    const newEnd = new Date(payload.checkOutDate).getTime();

    for (const asg of existingAssignments) {
      const existStart = new Date(asg.checkInDate).getTime();
      const existEnd = new Date(asg.checkOutDate).getTime();
      // Overlap condition
      if (newStart <= existEnd && newEnd >= existStart) {
        return {
          success: false,
          message: `Konflik jadwal! Bed ${targetBed.bedNumber} sudah teralokasi pada periode tersebut (${asg.checkInDate} s.d ${asg.checkOutDate}).`,
        };
      }
    }

    // Save Assignment
    const assignmentId = `asg_${Date.now()}`;
    const assignment: RoomAssignment = {
      id: assignmentId,
      applicationId: app.id,
      patientId: app.patientId,
      patientName: app.patient?.fullName || '-',
      companionName: app.companion?.hasCompanion ? app.companion.fullName : undefined,
      buildingId: targetRoom.buildingId,
      buildingName: targetRoom.buildingName || 'Gedung Utama',
      roomId: targetRoom.id,
      roomNumber: targetRoom.roomNumber,
      roomName: targetRoom.roomName,
      bedId: targetBed.id,
      bedNumber: targetBed.bedNumber,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      status: 'assigned',
      notes: payload.notes,
      assignedBy: payload.actor.name,
      assignedAt: new Date().toISOString(),
    };

    const assignments = this.getRoomAssignments();
    assignments.push(assignment);
    this.set(STORAGE_KEYS.ROOM_ASSIGNMENTS, assignments);

    // Update bed status to occupied
    targetBed.status = 'occupied';
    targetBed.currentPatientName = app.patient?.fullName;
    targetBed.currentAssignmentId = assignmentId;
    this.saveBed(targetBed);

    // Link into application
    app.roomAssignment = assignment;
    this.saveApplication(app);

    // Audit Log
    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: payload.actor.id,
      actorName: payload.actor.name,
      actorRole: payload.actor.role,
      action: 'ASSIGN_ROOM_AND_BED',
      entityType: 'RoomAssignment',
      entityId: assignmentId,
      outcome: 'success',
      details: `Alokasi kamar ${targetRoom.roomName} (${targetBed.bedNumber}) untuk pasien ${app.patient?.fullName} periode ${payload.checkInDate} s.d ${payload.checkOutDate}`,
    });

    return {
      success: true,
      message: `Bed ${targetBed.bedNumber} di ${targetRoom.roomName} berhasil dialokasikan untuk pasien.`,
      assignment,
    };
  }

  // --- CHECK-IN / CHECK-OUT MANAGEMENT ---
  updateStayStatus(
    assignmentId: string,
    action: 'check_in' | 'check_out',
    actor: User
  ): { success: boolean; message: string } {
    const assignments = this.getRoomAssignments();
    const asg = assignments.find((a) => a.id === assignmentId);
    if (!asg) return { success: false, message: 'Data penempatan tidak ditemukan.' };

    const beds = this.getBeds();
    const bed = beds.find((b) => b.id === asg.bedId);

    if (action === 'check_in') {
      asg.status = 'checked_in';
      asg.actualCheckInAt = new Date().toISOString();
      if (bed) {
        bed.status = 'occupied';
        bed.currentPatientName = asg.patientName;
        this.saveBed(bed);
      }
    } else if (action === 'check_out') {
      asg.status = 'checked_out';
      asg.actualCheckOutAt = new Date().toISOString();
      if (bed) {
        // Free up the bed immediately!
        bed.status = 'available';
        bed.currentPatientName = undefined;
        bed.currentAssignmentId = undefined;
        this.saveBed(bed);
      }
    }

    this.set(STORAGE_KEYS.ROOM_ASSIGNMENTS, assignments);

    // Update inside application object as well
    const app = this.getApplicationById(asg.applicationId);
    if (app && app.roomAssignment) {
      app.roomAssignment = asg;
      this.saveApplication(app);
    }

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: action.toUpperCase(),
      entityType: 'RoomAssignment',
      entityId: assignmentId,
      outcome: 'success',
      details: `Pasien ${asg.patientName} telah ${action === 'check_in' ? 'Check-In masuk kamar' : 'Check-Out dan bed dibebaskan'}.`,
    });

    return {
      success: true,
      message: `Status pasien berhasil diperbarui menjadi ${action === 'check_in' ? 'Check-In' : 'Check-Out'}.`,
    };
  }

  getRoomAssignments(): RoomAssignment[] {
    const list = this.get<RoomAssignment[]>(STORAGE_KEYS.ROOM_ASSIGNMENTS, []);
    if (list.length === 0) {
      // populate from initial app if available
      const app1 = INITIAL_APPLICATIONS[0];
      if (app1.roomAssignment) {
        list.push(app1.roomAssignment);
        this.set(STORAGE_KEYS.ROOM_ASSIGNMENTS, list);
      }
    }
    return list;
  }

  // --- SECURE PUBLIC TRACKING (Brute Force Protected) ---
  trackApplicationSecurely(
    applicationNumber: string,
    nikLast4: string,
    accessCode: string
  ): {
    success: boolean;
    message: string;
    isLocked?: boolean;
    app?: Omit<Application, 'accessCode'>;
  } {
    const app = this.getApplicationByNumber(applicationNumber);

    // Generic error message to prevent enumeration attacks
    const GENERIC_ERROR = 'Kombinasi Nomor Permohonan, NIK, atau Kode Akses tidak sesuai.';

    if (!app) {
      return { success: false, message: GENERIC_ERROR };
    }

    if (app.isLocked) {
      return {
        success: false,
        isLocked: true,
        message: 'Akses permohonan ini dikunci sementara karena melebihi batas percobaan. Silakan hubungi Call Center Dinas Kesehatan.',
      };
    }

    // Verify NIK last 4 digits and 6-digit access code
    const isNikMatch = app.patient?.nik.endsWith(nikLast4.trim());
    const isCodeMatch = app.accessCode.trim() === accessCode.trim();

    if (!isNikMatch || !isCodeMatch) {
      app.trackingAttempts = (app.trackingAttempts || 0) + 1;
      app.lastTrackingAttemptAt = new Date().toISOString();

      if (app.trackingAttempts >= 5) {
        app.isLocked = true;
      }
      this.saveApplication(app);

      if (app.isLocked) {
        return {
          success: false,
          isLocked: true,
          message: 'Batas percobaan (5x) terlampaui. Permohonan dikunci demi keamanan data pribadi pasien.',
        };
      }

      return {
        success: false,
        message: `${GENERIC_ERROR} (Sisa percobaan: ${5 - app.trackingAttempts})`,
      };
    }

    // Reset attempts on successful authentication
    app.trackingAttempts = 0;
    this.saveApplication(app);

    // Return sanitized object without raw accessCode
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { accessCode: _, ...safeApp } = app;
    return { success: true, message: 'Verifikasi berhasil.', app: safeApp };
  }

  // --- STATUS HISTORIES & AUDIT LOGS ---
  getStatusHistories(applicationId?: string): ApplicationStatusHistory[] {
    const list = this.get<ApplicationStatusHistory[]>(STORAGE_KEYS.STATUS_HISTORIES, []);
    if (applicationId) {
      return list.filter((h) => h.applicationId === applicationId);
    }
    return list;
  }

  addStatusHistory(history: ApplicationStatusHistory): void {
    const list = this.getStatusHistories();
    list.unshift(history);
    this.set(STORAGE_KEYS.STATUS_HISTORIES, list);
  }

  getAuditLogs(): AuditLog[] {
    return this.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  addAuditLog(log: AuditLog): void {
    const list = this.getAuditLogs();
    list.unshift(log);
    // Limit to latest 500 records
    if (list.length > 500) list.pop();
    this.set(STORAGE_KEYS.AUDIT_LOGS, list);
  }

  // --- NOTIFICATIONS ---
  getNotifications(role?: UserRole): Notification[] {
    const list = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, [
      {
        id: 'notif_welcome',
        targetRole: 'all',
        title: 'Sistem Terhubung',
        message: 'SIM-RSP Dinas Kesehatan aktif dan siap melayani pendaftaran masyarakat.',
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    if (!role || role === 'super_admin') return list;
    return list.filter((n) => n.targetRole === 'all' || n.targetRole === role);
  }

  addNotification(n: Notification): void {
    const list = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    list.unshift(n);
    this.set(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  markNotificationRead(id: string): void {
    const list = this.get<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const notif = list.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.set(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  }

  // --- SYSTEM SETTINGS ---
  getSystemSettings(): SystemSetting[] {
    return this.get<SystemSetting[]>(STORAGE_KEYS.SYSTEM_SETTINGS, INITIAL_SYSTEM_SETTINGS);
  }

  saveSystemSetting(setting: SystemSetting): void {
    const list = this.getSystemSettings();
    const idx = list.findIndex((s) => s.id === setting.id || s.key === setting.key);
    if (idx >= 0) {
      list[idx] = setting;
    } else {
      list.push(setting);
    }
    this.set(STORAGE_KEYS.SYSTEM_SETTINGS, list);
  }

  // Reset demo state if user wants fresh seed data
  resetAllData(): void {
    localStorage.clear();
    this.set(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.set(STORAGE_KEYS.DOC_REQUIREMENTS, INITIAL_DOC_REQUIREMENTS);
    this.set(STORAGE_KEYS.BUILDINGS, INITIAL_BUILDINGS);
    this.set(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    this.set(STORAGE_KEYS.BEDS, INITIAL_BEDS);
    this.set(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
    this.set(STORAGE_KEYS.SYSTEM_SETTINGS, INITIAL_SYSTEM_SETTINGS);
    this.set(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
}

export const storage = new StorageService();
