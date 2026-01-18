
import { AppState } from './types';

const STORAGE_KEY = 'smart_attendance_v4_2';

const initialState: AppState = {
  departments: [],
  staff: [],
  attendance: [],
  classes: [],
  students: [],
  securityPin: '0000',
  notifications: [],
  institutionInfo: {
    directorate: '',
    schoolName: ''
  }
};

export const storageService = {
  load: (): AppState => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : initialState;
      return {
        ...initialState,
        ...parsed,
        institutionInfo: parsed.institutionInfo || initialState.institutionInfo
      };
    } catch (e) {
      console.error('Failed to load data from storage', e);
      return initialState;
    }
  },

  save: (state: AppState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save data to storage', e);
    }
  },

  exportJSON: (state: AppState) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `smart_attendance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }
};
