export interface Risk {
  level: 'warn' | 'critical';
  messageKey: string; // key for I18N
  details?: string;
}

export interface MrzResult {
  valid: boolean;
  format: 'TD1' | 'TD2' | 'TD3' | 'MRV_A' | 'MRV_B' | 'CN_CARD' | 'UNKNOWN'; // Added Format tracking
  type: 'PASSPORT' | 'CARD' | 'VISA' | 'UNKNOWN';
  rawLines: string[];
  fields: {
    documentNumber: string | null;
    documentNumberCheck: string | null;
    birthDate: string | null;
    birthDateCheck: string | null;
    expiryDate: string | null;
    expiryDateCheck: string | null;
    nationality: string | null;
    issuingState: string | null;
    sex: string | null;
    surname: string | null;
    givenNames: string | null;
    optionalData: string | null;     // TD3/TD2 Line 2, TD1 Line 1
    optionalDataCheck: string | null;
    optionalData2?: string | null;   // TD1 Line 2
    documentTypeRaw: string | null;
    detailedType: string | null; // Key for translation
    compositeCheck: string | null;
  };
  validations: {
    documentNumber: boolean;
    birthDate: boolean;
    expiryDate: boolean;
    optionalData: boolean;
    composite: boolean;
  };
  parsed: {
    birthDate: Date | null;
    expiryDate: Date | null;
    daysRemaining: number | null;
    age: number | null;
    extendedData?: {
      titleKey: string;
      text: string;
      truncated: number | null;
    };
  };
  logs: string[];
  calcLogs: string[]; // Detailed calculation logs e.g. "Check Digit: 9 | Calculated: 9..."
  risks: Risk[];
}

export interface RiskAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  messages: string[];
}