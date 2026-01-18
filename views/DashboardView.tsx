
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { Users, UserMinus, CheckCircle2, AlertTriangle, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardViewProps {
  state: AppState;
}

const DashboardView: React.FC<DashboardViewProps> = ({ state }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeStaff = state.staff.filter(s => !s.archived);
    const todayAttendance = state.attendance.filter(a => a.date === today);
    
    const absents = todayAttendance.filter(a => a.status === 'absent').length;
    const justified = todayAttendance.filter(a => a.status === 'mission' || a.status === 'medical').length;
    const presents = todayAttendance.filter(a => a.status === 'present').length;
    
    const attendanceRate = activeStaff.length > 0 
      ? Math.round((presents / activeStaff.length) * 100) 
      : 0;

    const absenceCounts: Record<string, number> = {};
    state.attendance.filter(a => a.status === 'absent').forEach(a => {
      absenceCounts[a.staffId] = (absenceCounts[a.staffId] || 0) + 1;
    });

    const frequentAbsentees = Object.entries(absenceCounts)
      .filter(([_, count]) => count >= 2)
      .map(([id, count]) => ({
        staff: state.staff.find(s => s.id === id),
        count
      }))
      .filter(item => item.staff && !item.staff.archived)
      .sort((a, b) => b.count - a.count);

    return {
      totalStaff: activeStaff.length,
      absentsToday: absents,
      justifiedToday: justified,
      attendanceRate,
      frequentAbsentees: frequentAbsentees.slice(0, 3)
    };
  }, [state]);

  const pieData = [
    { name: 'حاضر', value: stats.attendanceRate },
    { name: 'غياب', value: 100 - stats.attendanceRate },
  ];
  const PIE_COLORS = ['#4f46e5', '#f1f5f9'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h2 className="text-3xl font-black text-slate-800 tracking-tight">مرحباً، مدير المؤسسة 👋</h2>
           <p className="text-slate-500 font-bold mt-1">نظرة عامة على أداء وانضباط الطاقم لهذا اليوم</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-50">
           <Calendar size={18} className="text-indigo-600" />
           <span className="text-xs font-black text-slate-600">{new Date().toLocaleDateString('ar-DZ')}</span>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي الطاقم', val: stats.totalStaff, icon: Users, color: 'indigo', trend: 'نشط' },
          { label: 'الغيابات اليوم', val: stats.absentsToday, icon: UserMinus, color: 'rose', trend: 'تنبيه' },
          { label: 'نسبة الحضور', val: `${stats.attendanceRate}%`, icon: TrendingUp, color: 'emerald', trend: 'ممتاز' },
          { label: 'غياب مبرر', val: stats.justifiedToday, icon: CheckCircle2, color: 'amber', trend: 'موثق' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${item.color}-50 rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${item.color}-100 text-${item.color}-600 rounded-2xl`}>
                  <item.icon size={22} />
                </div>
                <span className={`text-[9px] font-black px-2 py-1 bg-${item.color}-50 text-${item.color}-600 rounded-lg uppercase tracking-widest`}>{item.trend}</span>
              </div>
              <p className="text-slate-400 text-xs font-black mb-1">{item.label}</p>
              <h3 className={`text-3xl font-black text-slate-800`}>{item.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Insight */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50">
           <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                 <ArrowUpRight className="text-indigo-600" />
                 مؤشر الحضور اللحظي
              </h4>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">تحديث فوري</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-[240px] relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                          data={pieData} 
                          innerRadius={65} 
                          outerRadius={90} 
                          paddingAngle={8} 
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((_, index) => <Cell key={index} fill={PIE_COLORS[index]} />)}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black text-indigo-600">{stats.attendanceRate}%</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase">الحضور</span>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <h5 className="text-xs font-black text-slate-800 mb-2">توصية المحرك الذكي 🤖</h5>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">
                       {stats.attendanceRate >= 90 
                          ? 'نسبة الحضور ممتازة جداً اليوم. هذا يعكس بيئة عمل محفزة.' 
                          : 'نلاحظ بعض التذبذب في الحضور اليوم، يفضل مراجعة مبررات الغياب.'}
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-indigo-50 rounded-2xl">
                       <p className="text-[10px] font-black text-indigo-600 uppercase mb-1">حاضرون</p>
                       <p className="text-xl font-black text-slate-800">{stats.totalStaff - stats.absentsToday}</p>
                    </div>
                    <div className="flex-1 p-4 bg-rose-50 rounded-2xl">
                       <p className="text-[10px] font-black text-rose-600 uppercase mb-1">غائبون</p>
                       <p className="text-xl font-black text-slate-800">{stats.absentsToday}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Alerts Section */}
        <div className="bg-[#1E1B4B] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform"></div>
           <h4 className="text-lg font-black mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-400" size={20} />
              تنبيهات الغياب المتكرر
           </h4>
           
           <div className="space-y-4 relative z-10">
              {stats.frequentAbsentees.length > 0 ? (
                stats.frequentAbsentees.map((item) => (
                   <div key={item.staff?.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                      <div className="w-10 h-10 bg-indigo-500/30 rounded-full flex items-center justify-center font-black text-indigo-200">
                        {item.count}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-sm truncate">{item.staff?.name}</p>
                        <p className="text-[10px] text-indigo-300 font-bold">تجاوز الحد المسموح</p>
                      </div>
                   </div>
                ))
              ) : (
                 <div className="py-10 text-center">
                    <CheckCircle2 size={40} className="mx-auto text-indigo-400 opacity-20 mb-3" />
                    <p className="text-indigo-300 text-sm font-bold">كل الموظفين منضبطون حالياً</p>
                 </div>
              )}
           </div>
           
           <button className="w-full mt-10 py-4 bg-indigo-600 text-white font-black text-xs rounded-2xl hover:bg-indigo-500 transition-all shadow-xl">
              عرض السجل الكامل
           </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
