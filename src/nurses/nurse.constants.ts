export const NURSE_SHIFTS = ['morning', 'evening', 'night'] as const;

export type NurseShift = (typeof NURSE_SHIFTS)[number];

export const NURSE_STATUSES = [
  'active',
  'on_leave',
  'inactive',
  'archived',
] as const;

export type NurseStatus = (typeof NURSE_STATUSES)[number];

export const NURSE_EDITABLE_STATUSES = [
  'active',
  'on_leave',
  'inactive',
] as const;

export type NurseEditableStatus = (typeof NURSE_EDITABLE_STATUSES)[number];
