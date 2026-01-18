
import React, { useState } from 'react';
import { AppState } from '../types';
import { storageService } from '../storage';
import { Save, Download, Upload, Shield, RefreshCw, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ state, updateState }) => {
  const [pin, setPin] = useState(state.securityPin);

  const savePin = () => {
    updateState(prev => ({ ...prev, securityPin: pin }));
    alert('تم تحديث رمز الأمان بنجاح');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.classes && data.students) {
          updateState(() => data);
          alert('تم استيراد قاعدة البيانات بنجاح');
        } else {
          throw new Error('Invalid format');
        }
      } catch (e) {
        alert('خطأ في تنسيق ملف النسخة الاحتياطية');
      }
    };
    reader.readAsText(file);
  };

  // Add missing institutionInfo to satisfy AppState interface
  const clearAllData = () => {
    if (confirm('هل أنت متأكد من رغبتك في حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      updateState(() => ({
        departments: [],
        staff: [],
        classes: [],
        students: [],
        attendance: [],
        securityPin: '0000',
        notifications: [],
        institutionInfo: {
          directorate: '',
          schoolName: ''
        }
      }));
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-800">الإعدادات والنظام</h2>
        <p className="text-slate-500 mt-1">إدارة أمن البيانات والنسخ الاحتياطي</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Security Section */}
        <div className="bg-white p-8 rounded-smart border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">الأمن والحماية</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 mr-2">رمز الأمان (PIN)</label>
              <input 
                type="password" 
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="0000"
                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-500 font-bold text-center tracking-widest"
                maxLength={6}
              />
              <p className="text-[10px] text-slate-400 px-4">يُستخدم هذا الرمز لحماية العمليات الحساسة مثل الحذف الكلي</p>
            </div>
            <button 
              onClick={savePin}
              className="w-full flex items-center justify-center gap-2 py-4 bg-amber-600 text-white font-bold rounded-2xl hover:bg-amber-700 shadow-lg shadow-amber-50"
            >
              <Save size={18} />
              <span>تحديث الرمز</span>
            </button>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-white p-8 rounded-smart border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <RefreshCw size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">صيانة البيانات</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => storageService.exportJSON(state)}
              className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-indigo-600 transition-all"
            >
              <div className="flex items-center gap-4">
                <Download className="text-indigo-600 group-hover:text-white" size={24} />
                <div className="text-right">
                  <p className="font-bold text-slate-800 group-hover:text-white">تصدير قاعدة البيانات</p>
                  <p className="text-xs text-slate-400 group-hover:text-indigo-200">تحميل نسخة JSON احتياطية</p>
                </div>
              </div>
            </button>

            <label className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl group hover:bg-emerald-600 transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <Upload className="text-emerald-600 group-hover:text-white" size={24} />
                <div className="text-right">
                  <p className="font-bold text-slate-800 group-hover:text-white">استيراد قاعدة البيانات</p>
                  <p className="text-xs text-slate-400 group-hover:text-emerald-200">رفع نسخة سابقة للنظام</p>
                </div>
              </div>
              <input type="file" className="hidden" accept=".json" onChange={handleImport} />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-10 p-8 bg-rose-50 rounded-smart border border-rose-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white text-rose-500 rounded-2xl shadow-sm">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-rose-800">منطقة الخطر</h3>
              <p className="text-sm text-rose-600 font-bold">تفريغ كافة السجلات والأقسام من الذاكرة المحلية</p>
            </div>
          </div>
          <button 
            onClick={clearAllData}
            className="px-8 py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
          >
            حذف كافة البيانات
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
