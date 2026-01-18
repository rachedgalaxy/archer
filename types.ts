
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'mission' | 'medical' | 'justified' | 'pe_kit';

export interface StaffCustomField {
  id: string;
  label: string;
  value: string;
}

export interface Staff {
  id: string;
  functionalCode?: string;
  name: string;
  phone?: string;
  email?: string;
  contractType?: string;
  jobTitle?: string;
  position: string;
  subject?: string;
  specialization: string;
  appointmentDate: string;
  birthDate: string;
  birthPlace?: string;
  ccp: string;
  grade: string;
  gradeDate: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  childrenCount: number;
  category: string;
  staffType: 'teacher' | 'admin' | 'support' | 'service' | 'restaurant';
  archived: boolean;
  customFields?: StaffCustomField[];
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  registrationNumber?: string;
  archived: boolean;
}

export interface ClassRoom {
  id: string;
  name: string;
  school: string;
  teacher: string;
  level: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface InstitutionInfo {
  directorate: string;
  schoolName: string;
}

export interface AppState {
  departments: Department[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  classes: ClassRoom[];
  students: Student[];
  securityPin: string;
  notifications: Notification[];
  institutionInfo: InstitutionInfo;
}
