import { SignatureStatus } from '../../types/models';

export interface EsignRequest {
  documentId: string;
  documentNumber: string;
  pdfDataUrlOrBytes: string;
  signerNik: string;
  signerName: string;
  signerPosition: string;
  signerEmail?: string;
  passphrase?: string;
  webhookCallbackUrl?: string;
}

export interface EsignResponse {
  success: boolean;
  transactionId: string;
  status: SignatureStatus;
  certificateIssuer?: string;
  certificateSerialNumber?: string;
  signedDocumentHash?: string;
  signedPdfUrl?: string;
  errorMessage?: string;
  timestamp: string;
}

export interface EsignStatusCheckResponse {
  transactionId: string;
  status: SignatureStatus;
  isCompleted: boolean;
  certificateIssuer?: string;
  signedAt?: string;
  signedDocumentHash?: string;
  errorMessage?: string;
}

export interface IEsignProvider {
  readonly providerName: string;
  readonly isSandbox: boolean;
  submitForSigning(request: EsignRequest): Promise<EsignResponse>;
  checkStatus(transactionId: string): Promise<EsignStatusCheckResponse>;
  simulateWebhookCallback(transactionId: string, forceStatus?: SignatureStatus): Promise<EsignStatusCheckResponse>;
}
