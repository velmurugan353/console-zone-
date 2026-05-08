import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  DollarSign,
  Users,
  ShoppingBag,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart3,
  TrendingUp,
  Zap,
  Cpu,
  Globe,
  Terminal
} from 'lucide-react';

const analyticsData = [
  { name: 'Jan', revenue: 45000, rentals: 28000, sales: 12000, repairs: 5000 },
  { name: 'Feb', revenue: 52000, rentals: 31000, sales: 15000, repairs: 6000 },
  { name: 'Mar', revenue: 48000, rentals: 29000, sales: 13000, repairs: 6000 },
  { name: 'Apr', revenue: 61000, rentals: 35000, sales: 18000, repairs: 8000 },
  { name: 'May', revenue: 55000, rentals: 32000, sales: 16000, repairs: 7000 },
  { name: 'Jun', revenue: 67000, rentals: 38000, sales: 20000, repairs: 9000 },
  { name: 'Jul', revenue: 72000, rentals: 42000, sales: 21000, repairs: 9000 },
];

const COLORS = ['#D866FF', '#3B82F6', '#10B981', '#F59E0B'];

const StatCard = ({ title, value, change, icon: Icon, trend, label }: any) => (
  <div className="bg-[#080112] p-6 rounded-xl border border-white/10 relative overflow-hidden group hover:border-gaming-accent/30 transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="h-16 w-16 text-gaming-accent" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/5 border border-white/5 rounded-lg">
          <Icon className="h-5 w-5 text-gaming-accent" />
        </div>
        <div className={`flex items-center text-[10px] font-mono font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
          {change}
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
        </div>
      </div>
      <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white tracking-tighter">{value}</p>
      <p className="text-[9px] font-mono text-gray-600 uppercase mt-2 tracking-tighter">{label}</p>
    </div>
  </div>
);

const categoryEfficiency = [
  { subject: 'Revenue', A: 120, B: 110, fullMark: 150 },
  { subject: 'Utilization', A: 98, B: 130, fullMark: 150 },
  { subject: 'Growth', A: 86, B: 130, fullMark: 150 },
  { subject: 'Duration', A: 99, B: 100, fullMark: 150 },
  { subject: 'Retention', A: 85, B: 90, fullMark: 150 },
  { subject: 'Satisfaction', A: 65, B: 85, fullMark: 150 },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="h-3 w-3 text-gaming-accent animate-pulse" />
            <span className="text-[10px] font-mono text-gaming-accent uppercase tracking-[0.2em]">Data Analytics // Revenue Matrix</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tighter uppercase italic">System <span className="text-gaming-accent">Insights</span></h1>
          <p className="text-gray-500 font-mono text-xs mt-1">Real-time Performance Metrics & Revenue Distribution</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center space-x-3">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">Live Stream Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="?72,400"
          change="+14.2%"
          trend="up"
          icon={DollarSign}
          label="Gross_Revenue_Index"
        />
        <StatCard
          title="Rental Yield"
          value="?42,000"
          change="+8.5%"
          trend="up"
          icon={Activity}
          label="Fleet_Utilization_Yield"
        />
        <StatCard
          title="Product Sales"
          value="?21,400"
          change="+12.1%"
          trend="up"
          icon={ShoppingBag}
          label="Direct_Market_Sales"
        />
        <StatCard
          title="Repair Revenue"
          value="?9,000"
          change="+18.4%"
          trend="up"
          icon={Zap}
          label="Service_Protocol_Revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#080112] p-6 rounded-xl border border-white/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-4 w-4 text-gaming-accent" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-white">Revenue Distribution Trend</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-gaming-accent" />
                <span className="text-[8px] font-mono text-gray-500 uppercase">Rentals</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                <span className="text-[8px] font-mono text-gray-500 uppercase">Sales</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-[8px] font-mono text-gray-500 uppercase">Repairs</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-gaming-accent)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-gaming-accent)" stopOpacity={0} />                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff20"
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff20"
                  fontSize={10}
                  fontFamily="monospace"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `?${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080112', border: '1px solid #ffffff10', borderRadius: '8px', fontFamily: 'monospace', fontSize: '10px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="rentals" stroke="var(--color-gaming-accent)" fillOpacity={1} fill="url(#colorRentals)" strokeWidth={2} />
                <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="repairs" stroke="#10B981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#080112] p-6 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-8">
            <Target className="h-4 w-4 text-gaming-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-white">Efficiency Index</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryEfficiency}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" stroke="#666" fontSize={10} fontFamily="monospace" />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke="var(--color-gaming-accent)"
                  fill="var(--color-gaming-accent)"
                  fillOpacity={0.5}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-500 uppercase">System Load</span>
              <span className="text-[10px] font-mono text-emerald-500 uppercase">Optimal</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gaming-accent w-[78%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#080112] p-6 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-8">
            <Terminal className="h-4 w-4 text-gaming-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-white">Performance Logs</h3>
          </div>
          <div className="space-y-4">
            {[
              { event: 'RENTAL_YIELD_MAX', status: 'SUCCESS', value: '+12%', time: '2m ago' },
              { event: 'STOCK_SYNC_COMPLETE', status: 'ACTIVE', value: '100%', time: '5m ago' },
              { event: 'PAYMENT_GATEWAY_UP', status: 'STABLE', value: '99.9%', time: '12m ago' },
              { event: 'REPAIR_QUEUE_LOAD', status: 'NORMAL', value: '14%', time: '15m ago' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded font-mono">
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-gray-500">{log.time}</span>
                  <span className="text-[10px] text-white uppercase tracking-tighter">{log.event}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-gaming-accent">{log.value}</span>
                  <span className="text-[9px] text-emerald-500 uppercase font-bold">{log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#080112] p-6 rounded-xl border border-white/10">
          <div className="flex items-center space-x-3 mb-8">
            <Globe className="h-4 w-4 text-gaming-accent" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-white">Market Distribution</h3>
          </div>
          <div className="space-y-6">
            {[
              { name: 'Consoles', revenue: '?28,400', growth: '+12.5%', color: 'bg-gaming-accent' },
              { name: 'VR Gear', revenue: '?15,600', growth: '+8.2%', color: 'bg-[#3B82F6]' },
              { name: 'Games', revenue: '?12,500', growth: '+15.1%', color: 'bg-[#10B981]' },
              { name: 'Repairs', revenue: '?9,000', growth: '+18.4%', color: 'bg-[#F59E0B]' },
            ].map((cat) => (
              <div key={cat.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                    <span className="text-[10px] font-mono text-white uppercase tracking-widest">{cat.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono text-white font-bold">{cat.revenue}</span>
                    <span className="text-[9px] font-mono text-emerald-500">{cat.growth}</span>
                  </div>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${Math.random() * 40 + 30}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

