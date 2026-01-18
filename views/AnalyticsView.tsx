
import React, { useMemo } from 'react';
import { AppState } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Calendar, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  const analyticsData = useMemo(() => {
    // 1. Last 10 days trend
    const last10Days: Record<string, number> = {};
    const today = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last10Days[dateStr] = 0;
    }

    state.attendance.forEach(a => {
      if (a.status === 'absent' && last10Days[a.date] !== undefined) {
        last10Days[a.date]++;
      }
    });

    const trendData = Object.entries(last10Days).map(([date, count]) => ({
      date: date.split('-').slice(1).join('/'),
      absences: count
    }));

    // 2. Status distribution
    const statusCounts = {
      present: 0,
      absent: 0,
      justified: 0,
      pe_kit: 0
    };

    state.attendance.forEach(a => {
      statusCounts[a.status]++;
    });

    const distData = [
      { name: 'حضور', value: statusCounts.present, color: '#10b981' },
      { name: 'غياب', value: statusCounts.absent, color: '#f43f5e' },
      { name: 'غياب مبرر', value: statusCounts.justified, color: '#f59e0b' },
      { name: 'بذلة رياضية', value: statusCounts.pe_kit, color: '#4f46e5' },
    ].filter(d => d.value > 0);

    return { trendData, distData };
  }, [state.attendance]);

  return (
    <div className="space-y-10 animate-in fade-in zoom-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold text-slate-800">مختبر التحليل الذكي</h2>
        <p className="text-slate-500 mt-1">تقارير بيانية مفصلة حول انضباط التلاميذ</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Trend Chart */}
        <div className="bg-white p-8 rounded-smart border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">تطور الغياب</h3>
              <p className="text-xs text-slate-400 font-bold">آخر 10 أيام</p>
            </div>
          </div>
          
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="absences" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-8 rounded-smart border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <PieIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">توزيع الحالات</h3>
              <p className="text-xs text-slate-400 font-bold">الإجمالي التاريخي</p>
            </div>
          </div>

          <div className="h-[350px]">
            {analyticsData.distData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.distData}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.distData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Activity size={48} className="mb-4 opacity-10" />
                <p className="font-bold">لا توجد بيانات كافية</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <div className="bg-indigo-600 p-10 rounded-smart text-white shadow-2xl shadow-indigo-200">
        <h3 className="text-2xl font-black mb-4">توصية المحرك الذكي 🤖</h3>
        <p className="text-indigo-100 max-w-2xl leading-relaxed font-bold">
          {analyticsData.trendData.slice(-1)[0]?.absences > 5 
            ? "نلاحظ ارتفاعاً طفيفاً في حالات الغياب خلال اليومين الأخيرين. نقترح إجراء تواصل مع أولياء أمور التلاميذ المتغيبين باستمرار لتعزيز الحضور المدرسي."
            : "معدلات الانضباط ممتازة جداً في الأيام الأخيرة. استمر في تعزيز البيئة التعليمية الإيجابية لتحفيز التلاميذ على الحضور الدائم."}
        </p>
      </div>
    </div>
  );
};

export default AnalyticsView;
