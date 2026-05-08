export interface KYCData {
  id?: string;
  fullName: string;
  phone: string;
  secondaryPhone?: string;
  drivingLicenseNumber: string;
  secondaryIdType?: string;
  secondaryIdNumber?: string;
  secondaryIdFrontUrl?: string;
  secondaryIdBackUrl?: string;
  address: string;
  idFrontUrl: string;
  idBackUrl: string;
  selfieUrl: string;
  selfieVideoUrl: string;
  livenessCheck: 'PASSED' | 'FAILED' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED';
  submittedAt: any;
  trustScore?: number;
  adminNotes?: string;
  verifiedBy?: string;
  addressRequiredForDelivery?: boolean;
  verifiedAt?: any;
  agentReports?: {
    agentName: string;
    status: 'PASS' | 'FAIL' | 'WARN' | 'WARNING';
    message: string;
    details?: string;
    timestamp?: string;
  }[];
}

export interface KYCStatus {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED';
  address?: string;
  fullName?: string;
}

const ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
const API_URL = ENV.PROD && !ENV.VITE_API_URL_FORCE 
  ? '' 
  : (ENV.VITE_API_URL || '');

const normalizeKYC = (doc: any): KYCData => {
  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    let finalUrl = url;
    if (!finalUrl.startsWith('http')) {
      finalUrl = `${API_URL}${finalUrl.startsWith('/') ? '' : '/'}${finalUrl}`;
    }
    try {
      finalUrl = decodeURI(finalUrl);
    } catch (e) {}
    return encodeURI(finalUrl);
  };

  return {
    ...doc,
    id: doc.id || doc._id,
    idFrontUrl: normalizeUrl(doc.idFrontUrl),
    idBackUrl: normalizeUrl(doc.idBackUrl),
    selfieUrl: normalizeUrl(doc.selfieUrl),
    selfieVideoUrl: normalizeUrl(doc.selfieVideoUrl),
    secondaryIdFrontUrl: normalizeUrl(doc.secondaryIdFrontUrl),
    secondaryIdBackUrl: normalizeUrl(doc.secondaryIdBackUrl),
  };
};

export const getKYCStatus = async (userId: string): Promise<KYCData | null> => {
  try {
    const token = localStorage.getItem('consolezone_token');
    const response = await fetch(`${API_URL}/api/kyc/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const data = await response.json().catch(() => ({}));
    return normalizeKYC(data);
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return null;
  }
};

export const getAllKYC = async (): Promise<KYCData[]> => {
  try {
    const token = localStorage.getItem('consolezone_token');
    const response = await fetch(`${API_URL}/api/kyc-all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return [];
    const data = await response.json().catch(() => []);
    return data.map(normalizeKYC);
  } catch (error) {
    console.error("Error fetching all KYC:", error);
    return [];
  }
};

export const submitKYC = async (userId: string, data: Partial<KYCData>): Promise<void> => {
  try {
    const token = localStorage.getItem('consolezone_token');
    const response = await fetch(`${API_URL}/api/kyc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId, ...data })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'KYC submission failed');
    }
  } catch (error) {
    console.error("Error submitting KYC:", error);
    throw error;
  }
};
export const uploadKYCDocument = async (
  userId: string,
  file: File,
  type: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('type', type);

  try {
    const token = localStorage.getItem('consolezone_token');
    const response = await fetch(`${API_URL}/api/kyc/upload`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json().catch(() => ({}));
    if (onProgress) onProgress(100);
    return data.url;
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
};

export const updateKYCStatus = async (
  id: string,
  status: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'REVERIFICATION_REQUESTED',
  notes?: string,
  verifiedBy?: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const token = localStorage.getItem('consolezone_token');
    const response = await fetch(`${API_URL}/api/kyc/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, notes, verifiedBy, verifiedAt: new Date().toISOString(), rejectionReason })
    });
    if (!response.ok) throw new Error('Failed to update KYC status');
  } catch (error) {
    console.error("Error updating KYC status:", error);
    throw error;
  }
};
