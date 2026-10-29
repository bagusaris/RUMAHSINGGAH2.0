import { EsignRequest, EsignResponse, EsignStatusCheckResponse, IEsignProvider } from './EsignProvider';
import { SignatureStatus } from '../../types/models';

export class MockSandboxEsignProvider implements IEsignProvider {
  readonly providerName = 'BSrE BSSN Sandbox Gateway (Resmi Simulasi)';
  readonly isSandbox = true;

  // In-memory transaction registry for development/sandbox mode
  private transactions: Map<string, {
    status: SignatureStatus;
    request: EsignRequest;
    signedAt?: string;
    signedDocumentHash?: string;
    certificateIssuer: string;
    certificateSerialNumber: string;
    errorMessage?: string;
  }> = new Map();

  async submitForSigning(request: EsignRequest): Promise<EsignResponse> {
    const transactionId = `BSRE-TX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    // Simulate generation of document hash (SHA-256 format)
    const simulatedHash = 'SHA256:' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Store in transaction table
    this.transactions.set(transactionId, {
      status: 'signed', // In realistic simulation, it completes or transitions
      request,
      signedAt: new Date().toISOString(),
      signedDocumentHash: simulatedHash,
      certificateIssuer: 'Balai Sertifikasi Elektronik (BSrE) - Badan Siber dan Sandi Negara (BSSN) CA RI',
      certificateSerialNumber: `ID-CERT-BSRE-${request.signerNik.substring(0, 6)}-${Date.now().toString(16).toUpperCase()}`,
    });

    return {
      success: true,
      transactionId,
      status: 'signed',
      certificateIssuer: 'Balai Sertifikasi Elektronik (BSrE) - Badan Siber dan Sandi Negara (BSSN) CA RI',
      certificateSerialNumber: `ID-CERT-BSRE-${request.signerNik.substring(0, 6)}-${Date.now().toString(16).toUpperCase()}`,
      signedDocumentHash: simulatedHash,
      timestamp: new Date().toISOString(),
    };
  }

  async checkStatus(transactionId: string): Promise<EsignStatusCheckResponse> {
    const tx = this.transactions.get(transactionId);
    if (!tx) {
      return {
        transactionId,
        status: 'signature_failed',
        isCompleted: false,
        errorMessage: 'ID Transaksi TTE tidak ditemukan di gateway BSrE',
      };
    }

    return {
      transactionId,
      status: tx.status,
      isCompleted: tx.status === 'signed' || tx.status === 'signature_failed',
      certificateIssuer: tx.certificateIssuer,
      signedAt: tx.signedAt,
      signedDocumentHash: tx.signedDocumentHash,
      errorMessage: tx.errorMessage,
    };
  }

  async simulateWebhookCallback(transactionId: string, forceStatus: SignatureStatus = 'signed'): Promise<EsignStatusCheckResponse> {
    const tx = this.transactions.get(transactionId);
    if (tx) {
      tx.status = forceStatus;
      if (forceStatus === 'signed') {
        tx.signedAt = new Date().toISOString();
      } else if (forceStatus === 'signature_failed') {
        tx.errorMessage = 'Sertifikat kedaluwarsa atau Passphrase salah diverifikasi oleh HSM BSrE';
      }
    }

    return this.checkStatus(transactionId);
  }
}

export const esignProviderInstance = new MockSandboxEsignProvider();
