export type SupportedLanguage = 'en-IN' | 'hi-IN' | 'mr-IN';

export interface CitizenProfile {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  state?: string;
  district?: string;
  occupation?: string;
  annualHouseholdIncome?: number;
  familyMembers?: number;
  childrenCount?: number;
  childrenAges?: number[];
  studentStatus?: boolean;
  farmerStatus?: boolean;
  landholdingAcres?: number;
  disabilityStatus?: boolean;
  disabilityPercentage?: number;
  maritalStatus?: 'married' | 'unmarried' | 'widowed' | 'divorced';
  socialCategory?: 'General' | 'OBC' | 'SC' | 'ST' | 'Minority';
  hasBplCard?: boolean;
  rationCardType?: 'Antyodaya' | 'BPL' | 'APL' | 'Orange' | 'Yellow' | 'White' | 'None';
  documentsAvailable: string[];
}

export interface SchemeDocumentRequirement {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
}

export interface SchemeRule {
  field: keyof CitizenProfile;
  operator: 'eq' | 'neq' | 'lte' | 'gte' | 'in' | 'contains' | 'boolean' | 'exists';
  value: any;
  label: string;
  weight: number; // For match confidence scoring
  isStrict: boolean; // If true and fails, marks as not_eligible
}

export interface Scheme {
  id: string;
  name: string;
  nativeNames: {
    hi: string;
    mr: string;
  };
  category: 'farmer' | 'health' | 'housing' | 'women_child' | 'livelihood' | 'pension' | 'education' | 'energy';
  type: 'Central' | 'Centrally Sponsored' | 'State (Maharashtra)' | 'State';
  state?: string; // e.g. "Maharashtra" or "All India"
  description: string;
  benefit: string;
  benefitAmount?: string;
  eligibilitySummary: string;
  rules: SchemeRule[];
  requiredDocuments: SchemeDocumentRequirement[];
  applicationSteps: string[];
  officialSource: string;
  lastVerified: string;
  isDemo?: boolean;
}

export type EligibilityStatus = 'eligible' | 'possibly_eligible' | 'not_eligible';

export interface SchemeMatchResult {
  scheme: Scheme;
  status: EligibilityStatus;
  matchScore: number; // 0 to 100
  reasons: string[];
  missingInformation: string[];
  missingDocuments: string[];
  applicationSteps: string[];
}

export interface ExtractedDocument {
  document_type: string;
  name?: string;
  annual_income?: number;
  certificate_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  state?: string;
  district?: string;
  category?: string;
  confidence: number;
  raw_text?: string;
  found_fields: Record<string, string | number>;
  missing_fields: string[];
  inconsistencies: string[];
  status: 'verified' | 'warning' | 'rejected';
}

export interface AuditCheck {
  checkName: string;
  status: 'pass' | 'warning' | 'fail';
  details: string;
  affectedDocuments: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface AuditResult {
  overallStatus: 'clean' | 'warnings' | 'critical_mismatch';
  checks: AuditCheck[];
  rejectionRiskScore: number;
  affidavitRequired: boolean;
  affidavitTemplate?: string;
  recommendations: string[];
  summary: string;
}

export type ScamClassification = 'verified' | 'suspicious' | 'fraudulent';

export interface ScamRiskFactor {
  category: 'payment_demand' | 'phishing_link' | 'fake_scheme' | 'urgency_coercion' | 'sensitive_data' | 'unrealistic_promise';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface OfficialSourceMatch {
  schemeName?: string;
  officialUrl: string;
  sourceName: string;
  isGovernmentDomain: boolean;
  notes: string;
}

export interface ScamAnalysisResult {
  classification: ScamClassification;
  riskScore: number; // 0 to 100
  confidence: number;
  extractedMessage: string;
  summary: string;
  riskFactors: ScamRiskFactor[];
  officialSources: OfficialSourceMatch[];
  safetyAdvice: string[];
  mandatoryWarning: string;
  verifiedSchemeDetails?: {
    name: string;
    actualBenefit: string;
    actualEligibility: string;
    officialPortal: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audioUrl?: string;
  detectedLanguage?: string;
  profileUpdates?: Partial<CitizenProfile>;
  matchedSchemesCount?: number;
  followUpQuestions?: string[];
}
