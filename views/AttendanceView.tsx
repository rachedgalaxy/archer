
import React, { useState, useMemo, useEffect } from 'react';
import { AppState, AttendanceStatus } from '../types';
import { 
  Search, 
  CheckCheck, 
  XCircle, 
  Clock, 
  Briefcase, 
  Stethoscope, 
  Users, 
  CheckCircle, 
  Info, 
  X,
  LayoutGrid,
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';

interface AttendanceViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
  addNotification: (message: string, type?: any) => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ state, updateState, addNotification }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // الحصول على تاريخ اليوم بتوقيت الجزائر (ISO)
  const getTodayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [viewDate, setViewDate] = useState(new Date());

  const statusConfig = [
    { id: 'present', icon: CheckCheck, color: 'emerald', label: 'حاضر', desc: 'الموظف متواجد في مكان عمله' },
    { id: 'absent', icon: XCircle, color: 'rose', label: 'غائب', desc: 'غياب غير مبرر أو لم يسجل دخوله بعد' },
    { id: 'late', icon: Clock, color: 'amber', label: 'متأخر', desc: 'وصول الموظف بعد التوقيت الرسمي' },
    { id: 'mission', icon: Briefcase, color: 'indigo', label: 'مهمة', desc: 'خروج رسمي لغرض إداري أو تربوي' },
    { id: 'medical', icon: Stethoscope, color: 'teal', label: 'مرضي', desc: 'غياب بموجب عطلة مرضية معتمدة' }
  ];

  const getStatus = (staffId: string) => {
    return state.attendance.find(a => a.staffId === staffId && a.date === selectedDate)?.status;
  };

  const stats = useMemo(() => {
    const active = state.staff.filter(s => !s.archived);
    const counts = { all: active.length, present: 0, absent: 0, late: 0, mission: 0, medical: 0 };
    active.forEach(s => {
      const status = getStatus(s.id);
      if (status && status in counts) counts[status as keyof typeof counts]++;
    });
    return counts;
  }, [state.staff, state.attendance, selectedDate]);

  const filteredStaff = useMemo(() => {
    return state.staff.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const status = getStatus(s.id);
      const matchesFilter = filterStatus === 'all' || status === filterStatus;
      return !s.archived && matchesSearch && matchesFilter;
    }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [state.staff, searchQuery, filterStatus, state.attendance, selectedDate]);

  const setStatus = (staffId: string, status: AttendanceStatus) => {
    updateState(prev => {
      const existingIdx = prev.attendance.findIndex(a => a.staffId === staffId && a.date === selectedDate);
      const newAttendance = [...prev.attendance];
      if (existingIdx > -1) {
        newAttendance[existingIdx] = { ...newAttendance[existingIdx], status };
      } else {
        newAttendance.push({
          id: Math.random().toString(36).substr(2, 9),
          staffId,
          date: selectedDate,
          status
        });
      }
      return { ...prev, attendance: newAttendance };
    });
  };

  const markAllPresent = () => {
    updateState(prev => {
      let newAttendance = [...prev.attendance];
      filteredStaff.forEach(person => {
        const existingIdx = newAttendance.findIndex(a => a.staffId === person.id && a.date === selectedDate);
        if (existingIdx > -1) {
          newAttendance[existingIdx] = { ...newAttendance[existingIdx], status: 'present' };
        } else {
          newAttendance.push({
            id: Math.random().toString(36).substr(2, 9),
            staffId: person.id,
            date: selectedDate,
            status: 'present'
          });
        }
      });
      return { ...prev, attendance: newAttendance };
    });
    addNotification(`تم تسجيل حضور القائمة ليوم ${selectedDate}`, 'success');
  };

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d.toLocaleDateString('en-CA'),
        dayName: d.toLocaleDateString('ar-DZ', { weekday: 'short' }),
        dayNum: i
      });
    }
    return days;
  }, [viewDate]);

  const handleGoToToday = () => {
    const today = getTodayStr();
    setSelectedDate(today);
    setViewDate(new Date());
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + offset);
    setViewDate(newDate);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800">سجل الانضباط اليومي</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${selectedDate === getTodayStr() ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <p className="text-slate-500 text-sm font-bold">
              تاريخ السجل: {new Date(selectedDate).toLocaleDateString('ar-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
              {selectedDate === getTodayStr() && <span className="mr-2 text-emerald-600 font-black">(اليوم)</span>}
            </p>
            <button 
              onClick={() => setIsInfoOpen(true)}
              className="p-1.5 bg-white text-indigo-600 rounded-full shadow-sm border border-slate-100 hover:bg-indigo-50 transition-colors"
            >
              <Info size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 no-print">
          <button 
            onClick={markAllPresent}
            className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-xl hover:bg-emerald-700 transition-all"
          >
            <CheckCircle size={18} />
            <span>تحضير المفلتر</span>
          </button>
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="البحث بالاسم..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-4 pr-12 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Date Picker Card */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 mb-8 no-print overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 leading-tight">اختر تاريخ السجل</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">سجل الحضور والغياب</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedDate !== getTodayStr() && (
              <button 
                onClick={handleGoToToday}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black hover:bg-indigo-100 transition-all"
              >
                <RotateCcw size={14} />
                العودة لليوم
              </button>
            )}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white text-slate-400 hover:text-indigo-600 transition-all rounded-lg shadow-sm"><ChevronRight size={18} /></button>
              <span className="text-[11px] font-black text-slate-600 min-w-[100px] text-center">
                {viewDate.toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white text-slate-400 hover:text-indigo-600 transition-all rounded-lg shadow-sm"><ChevronLeft size={18} /></button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {calendarDays.map(day => {
            const isSelected = selectedDate === day.date;
            const isToday = getTodayStr() === day.date;
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  flex flex-col items-center justify-center min-w-[64px] h-[84px] rounded-2xl transition-all duration-300 relative
                  ${isSelected ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105 z-10' : 
                    isToday ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                `}
              >
                <span className="text-[9px] font-black uppercase mb-1">{day.dayName}</span>
                <span className="text-2xl font-black leading-none">{day.dayNum}</span>
                {isToday && !isSelected && (
                  <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Filters Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 no-print overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${filterStatus === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
        >
          <LayoutGrid size={16} />
          <span>الكل ({stats.all})</span>
        </button>
        {statusConfig.map(config => (
          <button
            key={config.id}
            onClick={() => setFilterStatus(config.id as AttendanceStatus)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${filterStatus === config.id ? `bg-${config.color}-600 text-white shadow-lg` : `bg-white text-slate-500 hover:bg-${config.color}-50`}`}
          >
            <config.icon size={16} />
            <span>{config.label} ({stats[config.id as keyof typeof stats] || 0})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(person => {
          const status = getStatus(person.id);
          const currentConfig = statusConfig.find(c => c.id === status);
          const StatusIcon = currentConfig?.icon;
          
          return (
            <div key={person.id} className={`
              bg-white p-6 rounded-[2.5rem] border-2 transition-all duration-300 group relative overflow-hidden
              ${status === 'present' ? 'border-emerald-100' : 
                status === 'absent' ? 'border-rose-100' : 
                status === 'late' ? 'border-amber-100' : 
                status === 'mission' ? 'border-indigo-100' :
                status === 'medical' ? 'border-teal-100' : 'border-slate-50'}
              hover:shadow-2xl hover:-translate-y-1
            `}>
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-inner
                  ${status === 'present' ? 'bg-emerald-50 text-emerald-600' : 
                    status === 'absent' ? 'bg-rose-50 text-rose-600' : 
                    status === 'late' ? 'bg-amber-50 text-amber-600' : 
                    status === 'mission' ? 'bg-indigo-50 text-indigo-600' :
                    status === 'medical' ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'}
                `}>
                  {person.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-slate-800 text-sm truncate leading-tight">{person.name}</h4>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider truncate mt-0.5">{person.jobTitle || person.position}</p>
                </div>
                {StatusIcon && (
                  <div className={`p-1.5 rounded-lg bg-slate-50`}>
                    <StatusIcon size={16} className={`text-${currentConfig?.color}-500`} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {statusConfig.map((btn) => {
                  const BtnIcon = btn.icon;
                  return (
                    <button 
                      key={btn.id}
                      onClick={() => setStatus(person.id, btn.id as AttendanceStatus)}
                      className={`
                        p-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                        ${status === btn.id 
                          ? `bg-${btn.color}-600 text-white shadow-lg scale-110` 
                          : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}
                      `}
                      title={btn.label}
                    >
                      <BtnIcon size={18} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filteredStaff.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-black">لا توجد سجلات مطابقة لهذا التصنيف في تاريخ {selectedDate}</p>
             <button onClick={() => {setFilterStatus('all'); setSearchQuery(''); setSelectedDate(getTodayStr());}} className="mt-4 text-indigo-600 font-bold text-xs hover:underline">عرض الكل والعودة لليوم</button>
          </div>
        )}
      </div>

      {/* Icons Explanation Modal */}
      {isInfoOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl">
                   <Info size={22} />
                </div>
                <h3 className="text-xl font-black text-slate-800">دليل رموز الانضباط</h3>
              </div>
              <button onClick={() => setIsInfoOpen(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {statusConfig.map(config => {
                const ConfigIcon = config.icon;
                return (
                  <div key={config.id} className="flex gap-5 items-start p-4 rounded-2xl hover:bg-slate-50 transition-colors group">
                    <div className={`p-3.5 bg-${config.color}-50 text-${config.color}-600 rounded-2xl group-hover:scale-110 transition-transform`}>
                      <ConfigIcon size={24} />
                    </div>
                    <div>
                      <h5 className={`font-black text-sm text-${config.color}-700 mb-0.5`}>{config.label}</h5>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed">{config.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setIsInfoOpen(false)}
              className="w-full mt-10 py-4 bg-slate-900 text-white font-black text-sm rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
