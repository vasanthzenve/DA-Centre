import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Building2,
  Sparkles,
  UtensilsCrossed,
  Shirt,
  Network,
  Stethoscope,
  HeartHandshake,
  Activity,
  RotateCw,
  FileText,
  Layers,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types';

// Sparkline SVG component matching the screenshot's wave visuals
interface SparklineWaveProps {
  color: string;
  gradientId: string;
  type: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
}

const SparklineWave: React.FC<SparklineWaveProps> = ({ color, gradientId, type }) => {
  const getPath = () => {
    switch (type) {
      case 1:
        // Total Market Research: starts low, rises to crest, dips, climbs to high peak on right
        return 'M 0 38 C 18 38, 26 24, 38 22 C 50 20, 58 28, 70 20 C 82 12, 90 8, 100 6';
      case 2:
        // Veterinary Hospitals: crests at 40%, dips, climbs steeply to right peak
        return 'M 0 38 C 15 38, 28 32, 42 20 C 52 10, 60 26, 72 18 C 84 10, 92 6, 100 4';
      case 3:
        // Hygiene Products: double crest wave rising to the right
        return 'M 0 38 C 20 38, 30 20, 48 20 C 60 20, 68 32, 80 20 C 90 10, 96 8, 100 8';
      case 4:
        // Food Products: low curve, climbs, gentle dip, rises high to peak at top right
        return 'M 0 38 C 20 38, 30 24, 45 22 C 58 20, 68 28, 80 16 C 90 6, 95 4, 100 4';
      case 5:
        // Accessories: ripple wave rising towards the right
        return 'M 0 38 C 20 38, 30 26, 45 26 C 58 26, 66 34, 78 24 C 88 14, 94 8, 100 8';
      case 6:
        // Total Services: dip, rise to peak, dip and rise to top right
        return 'M 0 38 C 15 38, 28 28, 42 30 C 56 32, 65 18, 78 18 C 88 18, 94 10, 100 8';
      case 7:
        // Registered Doctors: two smooth rolling green hills
        return 'M 0 38 C 18 38, 25 24, 38 24 C 50 24, 58 32, 70 24 C 82 16, 92 14, 100 14';
      case 8:
      default:
        // Welfare Organizations: smooth ascending rolling blue wave
        return 'M 0 38 C 20 38, 35 28, 52 28 C 68 28, 80 18, 100 10';
    }
  };

  const path = getPath();
  const areaPath = `${path} L 100 40 L 0 40 Z`;

  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      fill="none"
      className="w-20 sm:w-22 md:w-24 lg:w-20 xl:w-24 2xl:w-26 h-8 sm:h-9 xl:h-10 flex-shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.38} />
          <stop offset="65%" stopColor={color} stopOpacity={0.12} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={path} stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [leftChartType, setLeftChartType] = useState<'bar' | 'area'>('bar');
  const [rightChartType, setRightChartType] = useState<'area' | 'bar'>('area');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard data from API', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  // Real database counts only
  const totalMarketResearch = stats?.totalMarketResearch ?? 0;
  const totalVeterinaryHospitals = stats?.totalVeterinaryHospitals ?? 0;
  const totalHygieneProducts = stats?.totalHygieneProducts ?? 0;
  const totalFoodProducts = stats?.totalFoodProducts ?? 0;
  const totalAccessories = stats?.totalAccessories ?? 0;
  const totalServices = stats?.totalServices ?? 0;
  const totalDoctors = stats?.totalDoctors ?? 0;
  const totalWelfareOrganizations = stats?.totalWelfareOrganizations ?? 0;

  // Chart datasets directly from verified database records
  const researchByStateData = (stats?.researchByState ?? [])
    .filter((d) => d && d.name && d.name !== 'null' && d.name !== 'undefined' && Number(d.value) > 0)
    .slice(0, 10)
    .map((d) => ({ name: String(d.name), value: Number(d.value) }));

  const hospitalsByCityData = (stats?.hospitalsByCity ?? [])
    .filter((d) => d && d.name && d.name !== 'null' && d.name !== 'undefined' && Number(d.value) > 0)
    .sort((a, b) => Number(b.value) - Number(a.value))
    .slice(0, 15)
    .map((d) => ({ name: String(d.name), value: Number(d.value) }));

  const kpis = [
    {
      title: 'Total Market Research',
      count: totalMarketResearch,
      icon: (
        <svg
          className="w-5.5 h-5.5 text-[#059669]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="13" width="3" height="7" rx="1.2" fill="currentColor" stroke="none" />
          <rect x="10.5" y="9" width="3" height="11" rx="1.2" fill="currentColor" stroke="none" />
          <rect x="17" y="5" width="3" height="15" rx="1.2" fill="currentColor" stroke="none" />
        </svg>
      ),
      bg: 'bg-[#E8FAF4] dark:bg-emerald-950/60',
      waveColor: '#10B981',
      gradId: 'wave-emerald',
      waveType: 1 as const,
    },
    {
      title: 'Veterinary Hospitals',
      count: totalVeterinaryHospitals,
      icon: (
        <svg
          className="w-5.5 h-5.5 text-[#2563EB]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 8h6" />
          <path d="M12 5v6" />
          <rect x="9" y="15" width="6" height="6" />
        </svg>
      ),
      bg: 'bg-[#EEF5FF] dark:bg-blue-950/60',
      waveColor: '#3B82F6',
      gradId: 'wave-blue',
      waveType: 2 as const,
    },
    {
      title: 'Hygiene Products',
      count: totalHygieneProducts,
      icon: <Sparkles className="w-5.5 h-5.5 text-[#9333EA]" />,
      bg: 'bg-[#F5EEFF] dark:bg-purple-950/60',
      waveColor: '#A855F7',
      gradId: 'wave-purple',
      waveType: 3 as const,
    },
    {
      title: 'Food Products',
      count: totalFoodProducts,
      icon: <UtensilsCrossed className="w-5.5 h-5.5 text-[#D97706]" />,
      bg: 'bg-[#FFF4E6] dark:bg-amber-950/60',
      waveColor: '#F59E0B',
      gradId: 'wave-amber',
      waveType: 4 as const,
    },
    {
      title: 'Accessories',
      count: totalAccessories,
      icon: <Shirt className="w-5.5 h-5.5 text-[#E11D48]" />,
      bg: 'bg-[#FFE4E6] dark:bg-rose-950/60',
      waveColor: '#F43F5E',
      gradId: 'wave-rose',
      waveType: 5 as const,
    },
    {
      title: 'Total Services',
      count: totalServices,
      icon: (
        <svg
          className="w-5.5 h-5.5 text-[#7C3AED]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="3" width="6" height="6" rx="1.5" />
          <rect x="3.5" y="15" width="6" height="6" rx="1.5" />
          <rect x="14.5" y="15" width="6" height="6" rx="1.5" />
          <path d="M12 9v3" />
          <path d="M6.5 12h11" />
          <path d="M6.5 12v3" />
          <path d="M17.5 12v3" />
        </svg>
      ),
      bg: 'bg-[#F5EEFF] dark:bg-purple-950/60',
      waveColor: '#8B5CF6',
      gradId: 'wave-violet',
      waveType: 6 as const,
    },
    {
      title: 'Registered Doctors',
      count: totalDoctors,
      icon: <Stethoscope className="w-5.5 h-5.5 text-[#059669]" />,
      bg: 'bg-[#E8FAF4] dark:bg-teal-950/60',
      waveColor: '#10B981',
      gradId: 'wave-teal',
      waveType: 7 as const,
    },
    {
      title: 'Welfare Organizations',
      count: totalWelfareOrganizations,
      icon: <HeartHandshake className="w-5.5 h-5.5 text-[#2563EB]" />,
      bg: 'bg-[#EEF5FF] dark:bg-blue-950/60',
      waveColor: '#3B82F6',
      gradId: 'wave-welfare',
      waveType: 8 as const,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* =================================================================== */}
      {/* 1. HIGH-TECH LIVE INTELLIGENCE HERO BANNER                          */}
      {/* =================================================================== */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-900/40 bg-[#030919] shadow-xl text-white">
        {/* Datacenter & Hologram Backdrop Image */}
        <div
          className="absolute inset-0 bg-cover bg-right sm:bg-center opacity-85 pointer-events-none"
          style={{ backgroundImage: `url('/assets/datacenter_banner.jpg')` }}
        />

        {/* Cinematic Gradient Overlays to preserve razor-sharp readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030919] via-[#041029]/95 via-45% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030919]/80 via-transparent to-transparent pointer-events-none" />

        {/* Floating Glowing Analytics Cards on the Right */}
        <div className="absolute right-48 top-12 hidden xl:flex flex-col gap-3 pointer-events-none">
          <div className="w-20 h-16 rounded-xl bg-blue-950/70 border border-cyan-400/40 backdrop-blur-md p-2 flex items-end justify-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <div className="w-2 h-6 bg-cyan-400 rounded-xs" />
            <div className="w-2 h-10 bg-cyan-300 rounded-xs" />
            <div className="w-2 h-8 bg-cyan-400 rounded-xs" />
          </div>
          <div className="w-20 h-14 rounded-xl bg-blue-950/70 border border-cyan-400/40 backdrop-blur-md p-2 flex items-end justify-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <div className="w-2 h-4 bg-cyan-400 rounded-xs" />
            <div className="w-2 h-6 bg-cyan-300 rounded-xs" />
            <div className="w-2 h-9 bg-cyan-400 rounded-xs" />
          </div>
        </div>

        {/* Banner Content Container */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-2xl">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold tracking-wider uppercase mb-4 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIVE RESEARCH INTELLIGENCE PLATFORM</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight leading-tight">
              <span>Veterinary Ecosystem &amp; Market </span>
              <span className="text-[#38BDF8] drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                Intelligence
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300/90 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl font-normal">
              Centralized data repository and analytics covering hospitals, marketplace products,
              doctors, services, and welfare networks across India.
            </p>

            {/* Bottom 4 Feature Tags */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-6 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
                <span>Data Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#38BDF8]" />
                <span>Research Insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#38BDF8]" />
                <span>Market Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#38BDF8]" />
                <span>India-wide Coverage</span>
              </div>
            </div>
          </div>

          {/* Top-Right Refresh Intelligence Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-slate-600/80 backdrop-blur-md text-white text-xs font-semibold shadow-md transition-all cursor-pointer hover:border-slate-500 active:scale-95"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Intelligence</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 8 KPI METRIC CARDS WITH SMOOTH SPARKLINE WAVES                   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 xl:gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-200/70 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center justify-between group overflow-hidden"
          >
            {/* Left: Squircle Icon, Label, Big Number */}
            <div className="flex items-center gap-3 min-w-0 pr-1">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${kpi.bg}`}
              >
                {kpi.icon}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <span className="text-[12px] sm:text-[12.5px] xl:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block leading-tight whitespace-normal sm:whitespace-nowrap">
                  {kpi.title}
                </span>
                <p className="text-[26px] sm:text-[28px] xl:text-[30px] font-extrabold text-[#0F172A] dark:text-white leading-none mt-1.5 tracking-tight flex-shrink-0">
                  {kpi.count.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Right: Anchored Sparkline Wave - safely positioned without overlapping number */}
            <div className="flex-shrink-0 self-end ml-auto -mb-1 pl-1">
              <SparklineWave color={kpi.waveColor} gradientId={kpi.gradId} type={kpi.waveType} />
            </div>
          </div>
        ))}
      </div>

      {/* =================================================================== */}
      {/* 3. THE 2 MAIN CHARTS (Research by State & Hospitals by City)       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Research by State */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Research by State
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Number of veterinary tech &amp; market research companies by state
                </p>
              </div>
            </div>

            {/* Dropdown Type Selector Button */}
            <button
              onClick={() => setLeftChartType((t) => (t === 'bar' ? 'area' : 'bar'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{leftChartType === 'bar' ? 'Bar Chart' : 'Area Chart'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="w-full" style={{ height: 280, minHeight: 280 }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={280}>
                {leftChartType === 'bar' ? (
                  <BarChart data={researchByStateData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={[0, (dataMax: number) => Math.max(160, Math.ceil(dataMax * 1.1))]}
                      ticks={[0, 40, 80, 120, 160]}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      name="Companies"
                      fill="#10B981"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                ) : (
                  <AreaChart data={researchByStateData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <defs>
                      <linearGradient id="researchAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={[0, (dataMax: number) => Math.max(160, Math.ceil(dataMax * 1.1))]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fill="url(#researchAreaGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Chart: Hospitals by City */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  Hospitals by City
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Veterinary hospitals mapped across tier-1 &amp; tier-2 cities
                </p>
              </div>
            </div>

            {/* Dropdown Type Selector Button */}
            <button
              onClick={() => setRightChartType((t) => (t === 'area' ? 'bar' : 'area'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{rightChartType === 'area' ? 'Area Chart' : 'Bar Chart'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="w-full" style={{ height: 280, minHeight: 280 }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height={280}>
                {rightChartType === 'area' ? (
                  <AreaChart data={hospitalsByCityData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <defs>
                      <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      domain={[0, (dataMax: number) => Math.max(240, Math.ceil(dataMax * 1.1))]}
                      ticks={[0, 60, 120, 180, 240]}
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Hospitals"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#blueAreaGrad)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={hospitalsByCityData} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 240]} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      name="Hospitals"
                      fill="#3B82F6"
                      radius={[6, 6, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
