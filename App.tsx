
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserSquare2, 
  Building2, 
  ClipboardCheck, 
  BarChart3, 
  Settings, 
  ShieldAlert,
  Menu,
  X,
  FileText,
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Printer
} from 'lucide-react';
import { AppState, Notification } from './types';
import { storageService } from './storage';

import DashboardView from './views/DashboardView';
import StaffView from './views/StaffView';
import AttendanceView from './views/AttendanceView';
import AnalyticsView from './views/AnalyticsView';
import SettingsView from './views/SettingsView';
import ReportsView from './views/ReportsView';
import PrintingView from './views/PrintingView';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => ({
    ...storageService.load(),
    notifications: []
  }));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState<{show: boolean, onConfirm: () => void} | null>(null);

  useEffect(() => {
    storageService.save(state);
  }, [state]);

  const addNotification = (message: string, type: Notification['type'] = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setState(prev => ({
      ...prev,
      notifications: [...prev.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== id)
      }));
    }, 4000);
  };

  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => updater(prev));
  };

  const verifyPin = () => {
    if (pinInput === state.securityPin) {
      if (showPinModal) showPinModal.onConfirm();
      setShowPinModal(null);
      setPinInput('');
      addNotification('تم التحقق من الصلاحية بنجاح', 'success');
    } else {
      addNotification('رمز الأمان غير صحيح', 'error');
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'الرئيسية', icon: LayoutDashboard },
    { id: 'attendance', name: 'الحضور اليومي', icon: ClipboardCheck },
    { id: 'staff', name: 'قاعدة الموظفين', icon: UserSquare2 },
    { id: 'printing', name: 'مركز الطباعة', icon: Printer },
    { id: 'reports', name: 'التقارير الرسمية', icon: FileText },
    { id: 'analytics', name: 'الإحصائيات', icon: BarChart3 },
    { id: 'settings', name: 'النظام', icon: Settings },
  ];

  const renderContent = () => {
    const props = { state, updateState, addNotification };
    switch (activeTab) {
      case 'dashboard': return <DashboardView {...props} />;
      case 'attendance': return <AttendanceView {...props} />;
      case 'staff': return <StaffView {...props} requestActionWithPin={(onConfirm) => setShowPinModal({show: true, onConfirm})} />;
      case 'printing': return <PrintingView {...props} />;
      case 'reports': return <ReportsView {...props} />;
      case 'analytics': return <AnalyticsView {...props} />;
      case 'settings': return <SettingsView {...props} />;
      default: return <DashboardView {...props} />;
    }
  };

  return (
    <div className="h-screen w-full flex bg-[#F0F2F5] text-slate-900 overflow-hidden font-cairo">
      {/* Toast Notifications */}
      <div className="fixed top-6 left-6 z-[100] space-y-3 pointer-events-none">
        {state.notifications.map(note => (
          <div key={note.id} className={`
            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-r-4 animate-in slide-in-from-left duration-300 pointer-events-auto
            ${note.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 
              note.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800' : 'bg-blue-50 border-blue-500 text-blue-800'}
          `}>
            {note.type === 'success' && <CheckCircle2 size={18} />}
            {note.type === 'error' && <AlertCircle size={18} />}
            {note.type === 'info' && <Info size={18} />}
            <span className="font-bold text-sm">{note.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar - Occupies Full Height */}
      <aside className={`
        fixed md:relative z-[60] h-full w-72 bg-white border-l border-slate-200 shadow-2xl transition-transform duration-500 ease-in-out no-print flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl text-white shadow-xl shadow-indigo-100">
              <Building2 size={32} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">النظام الذكي</h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">إصدار بريميوم 4.2</p>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black text-sm transition-all duration-300 group
                  ${activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}
                `}
              >
                <item.icon size={20} className={activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-3xl">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">مد</div>
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">الرتبة الحالية</p>
                   <p className="text-xs font-black text-slate-800">مدير المؤسسة</p>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 inset-x-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6 no-print flex-shrink-0">
          <div className="flex items-center gap-2">
             <Building2 size={24} className="text-indigo-600" />
             <span className="font-black text-slate-800">تسيير المؤسسة</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative no-scrollbar">
          <div className="max-w-6xl mx-auto pb-20">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Security PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md px-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">تأكيد الهوية</h3>
            <p className="text-slate-500 text-sm font-bold mb-8">يرجى إدخال رمز الأمان للمتابعة</p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center text-3xl p-5 bg-slate-50 border-none rounded-2xl mb-8 font-mono tracking-[1rem] focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && verifyPin()}
            />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={verifyPin} className="py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg hover:bg-indigo-700 transition-all">تأكيد</button>
              <button onClick={() => {setShowPinModal(null); setPinInput('');}} className="py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
