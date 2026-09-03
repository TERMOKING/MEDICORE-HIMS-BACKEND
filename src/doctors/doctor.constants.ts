export const DOCTOR_AVAILABLE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
  'All Days',
] as const;

export type DoctorAvailableDay = (typeof DOCTOR_AVAILABLE_DAYS)[number];
