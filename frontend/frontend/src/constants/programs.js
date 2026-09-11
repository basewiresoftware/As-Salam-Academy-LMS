// Mirrors Child.PROGRAM_CHOICES and Course.COURSE_TYPE in backend/api/models.py.
// The API sends the raw keys, so the display strings live here.

export const PROGRAM_LABELS = {
  quran: "Qur'an",
  youth_program: 'Youth Program',
  islamic_studies: 'Islamic Studies',
};

export const COURSE_TYPE_LABELS = {
  0: 'Youth Group',
  1: 'Hifz',
  2: 'Islamic Studies',
};

export const PAYMENT_STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Payment due',
};
