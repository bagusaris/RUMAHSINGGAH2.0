export type UserRole = 
  | 'public' 
  | 'health_admin' 
  | 'director' 
  | 'shelter_admin' 
  | 'super_admin';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'needs_revision'
  | 'verified'
  | 'pending_decision'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type DocumentStatus =
  | 'pending_review'
  | 'valid'
  | 'invalid'
  | 'revision_requested';

export type SignatureStatus =
  | 'not_requested'
  | 'pending_signature'
  | 'signed'
  | 'signature_failed'
  | 'cancelled';

export type PlacementStatus =
  | 'awaiting_placement'
  | 'assigned'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled';

export type RoomStatus =
  | 'available'
  | 'partially_occupied'
  | 'full'
  | 'maintenance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  nip?: string;
  position?: string;
  department?: string;
  password?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  nik: string; // 16 digits
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: 'L' | 'P';
  address: string;
  phone: string;
  emergencyPhone?: string;
  bpjsNumber?: string;
  diagnosa?: string;
}

export interface Companion {
  id: string;
  patientId: string;
  hasCompanion: boolean;
  fullName?: string;
  nik?: string;
  relationship?: string;
  phone?: string;
  needsAccommodation?: boolean;
}

export interface DocumentRequirement {
  id: string;
  code: string;
  name: string;
  description: string;
  isMandatory: boolean;
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  isActive: boolean;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  requirementId: string;
  docCode: string;
  docName: string;
  fileName: string;
  fileUrl: string; // base64 or secure object URI
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  reviewNotes?: string;
  uploadedAt: string;
  version: number;
}

export interface Application {
  id: string;
  applicationNumber: string; // e.g. RSP-202610-0042
  patientId: string;
  patient?: Patient;
  companion?: Companion;
  destinationHospital: string;
  referralLetterNumber: string;
  appointmentDate: string;
  plannedCheckInDate: string;
  estimatedStayDays: number;
  status: ApplicationStatus;
  accessCode: string; // 6-character secure code for public tracking
  trackingAttempts: number;
  lastTrackingAttemptAt?: string;
  isLocked: boolean;
  submittedAt: string;
  updatedAt: string;
  documents?: ApplicationDocument[];
  approvalDecision?: ApprovalDecision;
  approvalLetter?: ApprovalLetter;
  roomAssignment?: RoomAssignment;
}

export interface ApplicationReview {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  result: 'verified' | 'revision_requested' | 'rejected';
  comments: string;
  reviewedAt: string;
}

export interface ApprovalDecision {
  id: string;
  applicationId: string;
  directorId: string;
  directorName: string;
  directorNip: string;
  decision: 'approved' | 'rejected' | 'clarification_requested';
  reason: string;
  decidedAt: string;
}

export interface ApprovalLetter {
  id: string;
  applicationId: string;
  letterNumber: string; // e.g. 440/0842/DINKES-RSP/X/2026
  letterDate: string;
  signerName: string;
  signerNip: string;
  signerPosition: string;
  documentHash: string; // SHA-256
  signedDocumentHash?: string;
  verificationToken: string;
  qrCodeDataUrl?: string;
  pdfBlobUrl?: string;
  status: SignatureStatus;
  createdAt: string;
}

export interface EsignTransaction {
  id: string;
  letterId: string;
  applicationId: string;
  provider: 'bsre' | 'peruri' | 'privy' | 'sandbox';
  transactionId: string;
  status: SignatureStatus;
  certificateIssuer?: string;
  certificateSerialNumber?: string;
  signerIdentity?: string;
  signedAt?: string;
  requestPayload?: string;
  responsePayload?: string;
  signedDocumentHash?: string;
  retryCount: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  description: string;
  address: string;
  totalFloors: number;
}

export interface Room {
  id: string;
  buildingId: string;
  buildingName?: string;
  floorNumber: number;
  roomNumber: string;
  roomName: string;
  genderPolicy: 'male' | 'female' | 'family' | 'any';
  totalBeds: number;
  occupiedBeds: number;
  facilities: string[];
  status: RoomStatus;
  maintenanceNotes?: string;
}

export interface Bed {
  id: string;
  roomId: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'maintenance';
  currentPatientName?: string;
  currentAssignmentId?: string;
}

export interface RoomAssignment {
  id: string;
  applicationId: string;
  patientId: string;
  patientName: string;
  companionName?: string;
  buildingId: string;
  buildingName: string;
  roomId: string;
  roomNumber: string;
  roomName: string;
  bedId: string;
  bedNumber: string;
  companionBedId?: string;
  companionBedNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  actualCheckInAt?: string;
  actualCheckOutAt?: string;
  status: PlacementStatus;
  notes?: string;
  assignedBy: string;
  assignedAt: string;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  previousStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedBy: string;
  changedByName: string;
  reason?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  outcome: 'success' | 'failure';
  details: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  label: string;
  description: string;
  category: 'institution' | 'workflow' | 'esign' | 'shelter' | 'security';
}
