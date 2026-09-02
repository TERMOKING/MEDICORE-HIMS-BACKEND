export const APPOINTMENT_STATUSES = [
  'pending',
  'booked',
  'arrived',
  'checked_in',
  'fulfilled',
  'cancelled',
  'no_show',
  'waitlisted',
] as const;

export type AppointmentStatus =
  (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPES = [
  'new_consultation',
  'follow_up',
  'health_check',
  'procedure',
  'emergency',
] as const;

export type AppointmentType =
  (typeof APPOINTMENT_TYPES)[number];

export const CONSULTATION_MODES = [
  'in_person',
  'video',
  'telephone',
] as const;

export type ConsultationMode =
  (typeof CONSULTATION_MODES)[number];

export const APPOINTMENT_PRIORITIES = [
  'routine',
  'urgent',
  'emergency',
] as const;

export type AppointmentPriority =
  (typeof APPOINTMENT_PRIORITIES)[number];

export const APPOINTMENT_SOURCES = [
  'walk_in',
  'phone',
  'online',
  'staff',
] as const;

export type AppointmentSource =
  (typeof APPOINTMENT_SOURCES)[number];