export type CertificateStatus = 'VALID' | 'REVOKED' | 'NOT_FOUND' | 'TAMPERED';

export interface StudentCertificateResponse {
  serial: string;
  issuedAt: string;
  revokedAt?: string | null;
  pdfUrl?: string | null;
  verifyUrl: string;
}

export interface PublicCertificateVerifyResponse {
  serial: string;
  status: CertificateStatus;
  studentFullName?: string;
  courseTitle?: string;
  issuedAt?: string;
  revokedAt?: string | null;
}
