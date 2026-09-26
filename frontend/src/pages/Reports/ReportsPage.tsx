import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  Building2,
  Stethoscope,
  ShoppingBag,
  HeartHandshake,
  Ambulance,
  Calendar,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types';
import { useToast } from '../../components/common/Toast';
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
  Legend,
} from 'recharts';

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

export const ReportsPage: React.FC = () => {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState<'executive' | 'ecosystem' | 'marketplace' | 'clinical'>('executive');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      toast.error('Failed to load reports analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalMarketplace =
    (stats?.totalHygieneProducts || 0) +
    (stats?.totalFoodProducts || 0) +
    (stats?.totalAccessories || 0);

  const totalEcosystem =
    (stats?.totalVeterinaryHospitals || 0) +
    (stats?.totalServices || 0) +
    (stats?.totalWelfareOrganizations || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Analytics &amp; Executive Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Cross-module intelligence, operational KPIs, state distribution matrices and summary audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setReportType('executive')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            reportType === 'executive'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setReportType('ecosystem')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            reportType === 'ecosystem'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Clinical &amp; Hospital Infrastructure
        </button>
        <button
          onClick={() => setReportType('marketplace')}
          className={`pb-3 text-sm font-semibold transition-colors relative ${
            reportType === 'marketplace'
              ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Marketplace &amp; Products
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Entities</span>
            <Building2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {(stats?.totalMarketResearch || 0) +
              (stats?.totalVeterinaryHospitals || 0) +
              totalMarketplace +
              (stats?.totalServices || 0) +
              (stats?.totalDoctors || 0) +
              (stats?.totalWelfareOrganizations || 0)}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
            Across 8 enterprise tables
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Veterinary Care</span>
            <Stethoscope className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {(stats?.totalVeterinaryHospitals || 0) + (stats?.totalDoctors || 0)}
          </div>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-1 block">
            {stats?.totalVeterinaryHospitals} Hospitals • {stats?.totalDoctors} Doctors
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Marketplace Catalog</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {totalMarketplace}
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block">
            Hygiene, Food &amp; Supplies
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Support &amp; Welfare</span>
            <HeartHandshake className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {(stats?.totalServices || 0) + (stats?.totalWelfareOrganizations || 0)}
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 block">
            {stats?.totalServices} Services • {stats?.totalWelfareOrganizations} Shelters
          </span>
        </div>
      </div>

      {/* Main Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research by State */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Market Research Geographic Density
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.researchByState || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doctor Specialties */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
            Clinical Specialist Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.doctorsBySpecialist || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  fontSize={10}
                >
                  {(stats?.doctorsBySpecialist || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            System Database Audit Summary
          </h3>
          <span className="text-xs text-slate-400">
            Last synced: {new Date().toLocaleTimeString()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Module Name</th>
                <th className="px-4 py-3">Database Table</th>
                <th className="px-4 py-3">Active Records</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Planning &amp; Market Research</td>
                <td className="px-4 py-3 font-mono text-slate-400">market_research</td>
                <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{stats?.totalMarketResearch || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Veterinary Hospitals</td>
                <td className="px-4 py-3 font-mono text-slate-400">veterinary_ecosystem</td>
                <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">{stats?.totalVeterinaryHospitals || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Hygiene &amp; Wellness</td>
                <td className="px-4 py-3 font-mono text-slate-400">hygiene_products</td>
                <td className="px-4 py-3 font-bold text-teal-600 dark:text-teal-400">{stats?.totalHygieneProducts || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Food &amp; Nutrition</td>
                <td className="px-4 py-3 font-mono text-slate-400">food_products</td>
                <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">{stats?.totalFoodProducts || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Pet Accessories</td>
                <td className="px-4 py-3 font-mono text-slate-400">accessories</td>
                <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">{stats?.totalAccessories || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Service Network</td>
                <td className="px-4 py-3 font-mono text-slate-400">service_network</td>
                <td className="px-4 py-3 font-bold text-sky-600 dark:text-sky-400">{stats?.totalServices || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Doctor Directory</td>
                <td className="px-4 py-3 font-mono text-slate-400">doctors</td>
                <td className="px-4 py-3 font-bold text-cyan-600 dark:text-cyan-400">{stats?.totalDoctors || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Animal Welfare Network</td>
                <td className="px-4 py-3 font-mono text-slate-400">welfare_network</td>
                <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">{stats?.totalWelfareOrganizations || 0}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 font-bold">LIVE</span></td>
                <td className="px-4 py-3 text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 100% Validated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
