import type { PublicCertificateVerifyResponse, StudentCertificateResponse } from '@/app/types/certificate';

import { http } from './http';

export const certificateApi = {
  studentCourseCertificate(courseId: number) {
    return http.get<StudentCertificateResponse>(`/api/student/courses/${courseId}/certificate`);
  },
  adminRevokeCertificate(serial: string) {
    return http.post<void>(`/api/admin/certificates/${serial}/revoke`);
  },
  publicVerifyCertificate(serial: string) {
    return http.get<PublicCertificateVerifyResponse>(`/api/public/certificates/verify/${serial}`);
  },
};
