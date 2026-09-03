export const DIAGNOSIS_TYPES = [
  'provisional',
  'confirmed',
  'differential',
] as const;

export type DiagnosisType = (typeof DIAGNOSIS_TYPES)[number];

export const DIAGNOSIS_STATUSES = [
  'active',
  'resolved',
  'ruled_out',
  'entered_in_error',
] as const;

export type DiagnosisStatus = (typeof DIAGNOSIS_STATUSES)[number];
