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
  Database,
  FileSpreadsheet,
  ArrowRight,
  PlusCircle,
  FolderGit2,
  Scissors,
  FlaskConical,
  GraduationCap,
  Truck,
  Factory,
  Globe,
  Egg,
  Trash2,
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
import { DashboardStats, SidebarModule } from '../../types';
import { dynamicSidebarService } from '../../services/dynamicSidebarService';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';

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
        return 'M 0 38 C 18 38, 26 24, 38 22 C 50 20, 58 28, 70 20 C 82 12, 90 8, 100 6';
      case 2:
        return 'M 0 38 C 15 38, 28 32, 42 20 C 52 10, 60 26, 72 18 C 84 10, 92 6, 100 4';
      case 3:
        return 'M 0 38 C 20 38, 30 20, 48 20 C 60 20, 68 32, 80 20 C 90 10, 96 8, 100 8';
      case 4:
        return 'M 0 38 C 20 38, 30 24, 45 22 C 58 20, 68 28, 80 16 C 90 6, 95 4, 100 4';
      case 5:
        return 'M 0 38 C 20 38, 30 26, 45 26 C 58 26, 66 34, 78 24 C 88 14, 94 8, 100 8';
      case 6:
        return 'M 0 38 C 15 38, 28 28, 42 30 C 56 32, 65 18, 78 18 C 88 18, 94 10, 100 8';
      case 7:
        return 'M 0 38 C 18 38, 25 24, 38 24 C 50 24, 58 32, 70 24 C 82 16, 92 14, 100 14';
      case 8:
      default:
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
  const [customModules, setCustomModules] = useState<SidebarModule[]>([]);
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [leftChartType, setLeftChartType] = useState<'bar' | 'area'>('bar');
  const [rightChartType, setRightChartType] = useState<'area' | 'bar'>('area');
  const [categoryView, setCategoryView] = useState<'overview' | 'all'>('overview');
  const [moduleToDelete, setModuleToDelete] = useState<SidebarModule | null>(null);
  const toast = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [data, dynModules] = await Promise.all([
        dashboardService.getStats(),
        dynamicSidebarService.getAllModules().catch(() => [] as SidebarModule[]),
      ]);
      setStats(data);
      if (dynModules) setCustomModules(dynModules);
    } catch (err) {
      console.error('Failed to load dashboard data from API', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleModulesUpdated = () => fetchDashboardData();
    window.addEventListener('dynamic-modules-updated', handleModulesUpdated);
    return () => window.removeEventListener('dynamic-modules-updated', handleModulesUpdated);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData();
  };

  const handleDeleteModule = async () => {
    if (!moduleToDelete) return;
    try {
      await dynamicSidebarService.deleteModule(moduleToDelete.id);
      toast.success(`Module '${moduleToDelete.sidebarName}' deleted successfully.`);
      window.dispatchEvent(new CustomEvent('dynamic-modules-updated'));
      setModuleToDelete(null);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete module.');
    }
  };

  // Real database counts for all 16 core directories
  const totalMarketResearch = stats?.totalMarketResearch ?? 0;
  const totalVeterinaryHospitals = stats?.totalVeterinaryHospitals ?? 0;
  const totalHygieneProducts = stats?.totalHygieneProducts ?? 0;
  const totalFoodProducts = stats?.totalFoodProducts ?? 0;
  const totalAccessories = stats?.totalAccessories ?? 0;
  const totalServices = stats?.totalServices ?? 0;
  const totalDoctors = stats?.totalDoctors ?? 0;
  const totalWelfareOrganizations = stats?.totalWelfareOrganizations ?? 0;

  const totalFashionDesigners = stats?.totalFashionDesigners ?? 0;
  const totalDiagnosticLabs = stats?.totalDiagnosticLabs ?? 0;
  const totalFashionInstitutes = stats?.totalFashionInstitutes ?? 0;
  const totalCourierTier1 = stats?.totalCourierTier1 ?? 0;
  const totalPetManufacturers = stats?.totalPetManufacturers ?? 0;
  const totalPhilippinesPetProducts = stats?.totalPhilippinesPetProducts ?? 0;
  const totalLivestock = stats?.totalLivestock ?? 0;
  const totalPoultry = stats?.totalPoultry ?? 0;

  // Sum of all 16 core modules
  const totalCoreRecords =
    stats?.totalCoreRecords && stats.totalCoreRecords > 0
      ? stats.totalCoreRecords
      : totalMarketResearch +
        totalVeterinaryHospitals +
        totalHygieneProducts +
        totalFoodProducts +
        totalAccessories +
        totalServices +
        totalDoctors +
        totalWelfareOrganizations +
        totalFashionDesigners +
        totalDiagnosticLabs +
        totalFashionInstitutes +
        totalCourierTier1 +
        totalPetManufacturers +
        totalPhilippinesPetProducts +
        totalLivestock +
        totalPoultry;

  // Dynamic custom modules row count (from live customModules state and stats)
  const customModulesSum = customModules.reduce((acc, m) => acc + (m.totalRows || 0), 0);
  const calculatedDynamicRecords = Math.max(stats?.totalDynamicRecords ?? 0, customModulesSum);
  const totalDynamicModulesCount = customModules.length > 0 ? customModules.length : (stats?.totalDynamicModules ?? 0);

  // Grand Total Records in DA Centre (All Core Modules + All Dynamic Custom Modules)
  const totalRecordsInDaCentre =
    stats?.totalRecords && stats.totalRecords > 0
      ? Math.max(stats.totalRecords, totalCoreRecords + calculatedDynamicRecords)
      : totalCoreRecords + calculatedDynamicRecords;

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

  // Primary 9 Category KPI cards (Core Highlights + Custom Dynamic Modules)
  const primaryKpis = [
    {
      title: 'Total Market Research',
      count: totalMarketResearch,
      route: '/market-research',
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
      route: '/veterinary-ecosystem',
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
      route: '/marketplace/hygiene',
      icon: <Sparkles className="w-5.5 h-5.5 text-[#9333EA]" />,
      bg: 'bg-[#F5EEFF] dark:bg-purple-950/60',
      waveColor: '#A855F7',
      gradId: 'wave-purple',
      waveType: 3 as const,
    },
    {
      title: 'Food Products',
      count: totalFoodProducts,
      route: '/marketplace/food',
      icon: <UtensilsCrossed className="w-5.5 h-5.5 text-[#D97706]" />,
      bg: 'bg-[#FFF4E6] dark:bg-amber-950/60',
      waveColor: '#F59E0B',
      gradId: 'wave-amber',
      waveType: 4 as const,
    },
    {
      title: 'Accessories',
      count: totalAccessories,
      route: '/marketplace/accessories',
      icon: <Shirt className="w-5.5 h-5.5 text-[#E11D48]" />,
      bg: 'bg-[#FFE4E6] dark:bg-rose-950/60',
      waveColor: '#F43F5E',
      gradId: 'wave-rose',
      waveType: 5 as const,
    },
    {
      title: 'Total Services',
      count: totalServices,
      route: '/service-network',
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
      route: '/doctors',
      icon: <Stethoscope className="w-5.5 h-5.5 text-[#059669]" />,
      bg: 'bg-[#E8FAF4] dark:bg-teal-950/60',
      waveColor: '#10B981',
      gradId: 'wave-teal',
      waveType: 7 as const,
    },
    {
      title: 'Welfare Organizations',
      count: totalWelfareOrganizations,
      route: '/welfare-network',
      icon: <HeartHandshake className="w-5.5 h-5.5 text-[#2563EB]" />,
      bg: 'bg-[#EEF5FF] dark:bg-blue-950/60',
      waveColor: '#3B82F6',
      gradId: 'wave-welfare',
      waveType: 8 as const,
    },
    {
      title: 'Custom Modules Data',
      count: calculatedDynamicRecords,
      route: '/dynamic-sidebar-builder',
      badgeText: `${totalDynamicModulesCount} Modules`,
      icon: <FileSpreadsheet className="w-5.5 h-5.5 text-[#4F46E5]" />,
      bg: 'bg-[#EEF2FF] dark:bg-indigo-950/60',
      waveColor: '#6366F1',
      gradId: 'wave-dynamic-kpi',
      waveType: 2 as const,
    },
  ];

  // Additional Core Modules array for full 17 categories view
  const additionalKpis = [
    {
      title: 'Fashion Designers',
      count: totalFashionDesigners,
      route: '/fashion-designers',
      icon: <Scissors className="w-5.5 h-5.5 text-[#EC4899]" />,
      bg: 'bg-[#FDF2F8] dark:bg-pink-950/60',
      waveColor: '#EC4899',
      gradId: 'wave-fashion-designers',
      waveType: 1 as const,
    },
    {
      title: 'Diagnostic Labs',
      count: totalDiagnosticLabs,
      route: '/human-pet-labs',
      icon: <FlaskConical className="w-5.5 h-5.5 text-[#06B6D4]" />,
      bg: 'bg-[#ECFEFF] dark:bg-cyan-950/60',
      waveColor: '#06B6D4',
      gradId: 'wave-diagnostic-labs',
      waveType: 2 as const,
    },
    {
      title: 'Fashion Institutes',
      count: totalFashionInstitutes,
      route: '/fashion-institutes',
      icon: <GraduationCap className="w-5.5 h-5.5 text-[#8B5CF6]" />,
      bg: 'bg-[#F5F3FF] dark:bg-violet-950/60',
      waveColor: '#8B5CF6',
      gradId: 'wave-fashion-institutes',
      waveType: 3 as const,
    },
    {
      title: 'Courier Tier 1',
      count: totalCourierTier1,
      route: '/courier-tier-1',
      icon: <Truck className="w-5.5 h-5.5 text-[#0284C7]" />,
      bg: 'bg-[#F0F9FF] dark:bg-sky-950/60',
      waveColor: '#0284C7',
      gradId: 'wave-courier-tier-1',
      waveType: 4 as const,
    },
    {
      title: 'Pet Manufacturers',
      count: totalPetManufacturers,
      route: '/pet-manufacturers',
      icon: <Factory className="w-5.5 h-5.5 text-[#10B981]" />,
      bg: 'bg-[#ECFDF5] dark:bg-emerald-950/60',
      waveColor: '#10B981',
      gradId: 'wave-pet-manufacturers',
      waveType: 5 as const,
    },
    {
      title: 'Philippines Pet Products',
      count: totalPhilippinesPetProducts,
      route: '/philippines-pet-products',
      icon: <Globe className="w-5.5 h-5.5 text-[#F59E0B]" />,
      bg: 'bg-[#FFFBEB] dark:bg-amber-950/60',
      waveColor: '#F59E0B',
      gradId: 'wave-philippines-products',
      waveType: 6 as const,
    },
    {
      title: 'Livestock Farms',
      count: totalLivestock,
      route: '/livestock',
      icon: <Layers className="w-5.5 h-5.5 text-[#EAB308]" />,
      bg: 'bg-[#FEFCE8] dark:bg-yellow-950/60',
      waveColor: '#EAB308',
      gradId: 'wave-livestock',
      waveType: 7 as const,
    },
    {
      title: 'Poultry Directory',
      count: totalPoultry,
      route: '/poultry',
      icon: <Egg className="w-5.5 h-5.5 text-[#14B8A6]" />,
      bg: 'bg-[#F0FDFA] dark:bg-teal-950/60',
      waveColor: '#14B8A6',
      gradId: 'wave-poultry',
      waveType: 8 as const,
    },
  ];

  const displayedKpis = categoryView === 'overview' ? primaryKpis : [...primaryKpis, ...additionalKpis];

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
      {/* 2. MASTER HIGHLIGHT: TOTAL RECORDS IN DA CENTRE                     */}
      {/* =================================================================== */}
      <div className="relative rounded-[28px] overflow-hidden p-6 sm:p-7 lg:p-8 bg-gradient-to-br from-white/95 via-sky-50/40 to-blue-50/50 dark:from-[#0B132B]/95 dark:via-[#0F172A]/90 dark:to-[#0A0F1D] border border-blue-200/80 dark:border-blue-500/30 shadow-xl shadow-blue-500/5 dark:shadow-blue-900/20 backdrop-blur-2xl transition-all duration-300">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-bl from-blue-500/20 via-cyan-400/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-500/15 to-transparent blur-3xl pointer-events-none" />

        {/* Master Total Header & Stats Breakdown */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-blue-100 dark:border-slate-800/80">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#2563EB] via-[#1D4ED8] to-[#0284C7] flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/30 border border-white/40 dark:border-white/20 text-white">
              <Database className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  DA Centre Master Metric
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10.5px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live System Count · Core &amp; Custom Modules
                </span>
              </div>
              <h2 className="text-base sm:text-lg xl:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Total Records in DA Centre
              </h2>
              <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                <p className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight leading-none">
                  {totalRecordsInDaCentre.toLocaleString()}
                </p>
                <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Grand Total Enterprise Records
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 self-start lg:self-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-left">
              <div className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Core Modules
                </span>
                <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                  {totalCoreRecords.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 block">16 Core Categories</span>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-indigo-200/70 dark:border-indigo-900/60 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 block">
                  Custom Modules
                </span>
                <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                  {calculatedDynamicRecords.toLocaleString()}
                </span>
                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 block">
                  {totalDynamicModulesCount} Excel Modules
                </span>
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-white/80 dark:bg-slate-800/70 border border-emerald-200/70 dark:border-emerald-900/60 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400 block">
                  Total Ecosystem
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                  {16 + totalDynamicModulesCount} Modules
                </span>
                <span className="text-[10px] text-emerald-500 dark:text-emerald-400 block">Auto-Synchronized</span>
              </div>
            </div>
            <div className="hidden xl:block flex-shrink-0 pl-2">
              <SparklineWave color="#2563EB" gradientId="wave-master-records" type={2} />
            </div>
          </div>
        </div>

        {/* Custom Dynamic Modules List & Excel Datasets Section */}
        <div className="relative z-10 pt-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                  <span>Custom Modules Data (Excel Uploads &amp; Auto Modules)</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                    {totalDynamicModulesCount} Active
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  User-created dynamic Excel modules automatically feed records into the DA Centre grand total.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/dynamic-sidebar-builder')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto hover:shadow-indigo-500/25 active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Dynamic Sidebar Builder</span>
            </button>
          </div>

          {customModules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {customModules.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => navigate(`/dynamic/${mod.moduleSlug}`)}
                  className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:shadow-md hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer group flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:animate-ping flex-shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
                          Dynamic Module
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {mod.sidebarName}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5" title={mod.uploadedFileName}>
                        {mod.uploadedFileName || 'Excel Dataset'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModuleToDelete(mod);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all flex-shrink-0">
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Total Records</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-extrabold">
                      {(mod.totalRows || 0).toLocaleString()} rows
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No custom dynamic Excel modules created yet
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload any .xlsx, .xls, or .csv file in the Dynamic Sidebar Builder. All records are automatically factored into the DA Centre Master KPI count.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dynamic-sidebar-builder')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              >
                <span>Upload First Excel File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. CATEGORY BREAKDOWN METRIC CARDS                                */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Ecosystem Category Breakdown
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
            {displayedKpis.length} Categories
          </span>
        </div>

        {/* View Switcher: Overview (9) vs All (17) */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setCategoryView('overview')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              categoryView === 'overview'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Overview (9)
          </button>
          <button
            onClick={() => setCategoryView('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              categoryView === 'all'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Categories (17)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 xl:gap-4">
        {displayedKpis.map((kpi, idx) => (
          <div
            key={idx}
            onClick={() => kpi.route && navigate(kpi.route)}
            className="p-3.5 sm:p-4 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-[24px] border border-white/80 dark:border-slate-800/80 shadow-md shadow-slate-200/30 dark:shadow-black/40 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-200 flex items-center justify-between group overflow-hidden cursor-pointer"
          >
            {/* Left: Squircle Icon, Label, Big Number */}
            <div className="flex items-center gap-3 min-w-0 pr-1">
              <div
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs border border-white/50 dark:border-white/10 ${kpi.bg}`}
              >
                {kpi.icon}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] sm:text-[12.5px] xl:text-[13px] font-semibold text-slate-600 dark:text-slate-300 block leading-tight truncate">
                    {kpi.title}
                  </span>
                  {'badgeText' in kpi && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold flex-shrink-0">
                      {(kpi as any).badgeText}
                    </span>
                  )}
                </div>
                <p className="text-[24px] sm:text-[26px] xl:text-[28px] font-extrabold text-[#0F172A] dark:text-white leading-none mt-1.5 tracking-tight flex-shrink-0">
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
      {/* 4. THE 2 MAIN CHARTS (Research by State & Hospitals by City)       */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Research by State */}
        <div className="p-6 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/30 dark:shadow-black/40 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-blue-950/60 border border-blue-500/25 flex items-center justify-center text-[#2563EB] dark:text-blue-400 flex-shrink-0">
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
        <div className="p-6 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/30 dark:shadow-black/40 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 dark:bg-blue-950/60 border border-blue-500/25 flex items-center justify-center text-[#2563EB] dark:text-blue-400 flex-shrink-0">
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

      {/* Delete Module Confirmation Modal */}
      {moduleToDelete && (
        <ConfirmDialog
          isOpen={!!moduleToDelete}
          onClose={() => setModuleToDelete(null)}
          onConfirm={handleDeleteModule}
          title="Delete Dynamic Module"
          message={`Are you sure you want to permanently delete the module '${moduleToDelete.sidebarName}'? All extracted fields and ${moduleToDelete.totalRows?.toLocaleString()} rows will be removed from the database and the sidebar item will be removed.`}
          confirmText="Permanently Delete"
          confirmVariant="danger"
          dataType="DynamicModule"
          dataId={moduleToDelete.id}
          dataTitle={moduleToDelete.sidebarName}
        />
      )}
    </div>
  );
};
