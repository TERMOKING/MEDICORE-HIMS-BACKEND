export const ENCOUNTER_STATUSES = [
  'in_progress',
  'on_hold',
  'completed',
  'signed',
  'cancelled',
] as const;

export type EncounterStatus = (typeof ENCOUNTER_STATUSES)[number];

export const ENCOUNTER_TYPES = [
  'outpatient',
  'inpatient',
  'emergency',
  'teleconsultation',
] as const;

export type EncounterType = (typeof ENCOUNTER_TYPES)[number];
