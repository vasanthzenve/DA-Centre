import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  FileCheck2,
  Database,
  Layers,
  Sparkles,
  List,
} from 'lucide-react';
import { ExcelImportModal } from '../../components/excel/ExcelImportModal';
import { ExcelExportModal } from '../../components/excel/ExcelExportModal';
import { marketResearchService } from '../../services/marketResearchService';
import { veterinaryEcosystemService } from '../../services/veterinaryEcosystemService';
import { hygieneService } from '../../services/hygieneService';
import { foodService } from '../../services/foodService';
import { accessoryService } from '../../services/accessoryService';
import { serviceNetworkService } from '../../services/serviceNetworkService';
import { doctorService } from '../../services/doctorService';
import { welfareNetworkService } from '../../services/welfareNetworkService';
import { useToast } from '../../components/common/Toast';

interface ModuleConfig {
  key: string;
  name: string;
  table: string;
  color: string;
  badgeBg: string;
  iconBg: string;
  description: string;
  fields: string[];
  service: any;
}

const MODULES: ModuleConfig[] = [
  {
    key: 'market-research',
    name: 'Planning & Market Research',
    table: 'market_research',
    color: 'text-indigo-600 dark:text-indigo-400',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
    description: 'Competitive market intelligence, funding, business models and regional scale',
    fields: ['States', 'Company', 'Founded', 'Cities', 'Model', 'Scale', 'Funding', 'Service', 'Revenue', 'Target Segment', 'Price', 'Product', 'Technology'],
    service: marketResearchService,
  },
  {
    key: 'veterinary-ecosystem',
    name: 'Veterinary Ecosystem',
    table: 'veterinary_ecosystem',
    color: 'text-emerald-600 dark:text-emerald-400',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    description: 'Hospitals, emergency clinics, opening hours, verified ratings and geolocations',
    fields: ['State', 'City', 'Area', 'Hospital Name', 'Address', 'Phone Number', 'Website', 'Opening Hours', 'Rating', 'Reviews', 'Business Status', 'Google Maps', 'Place ID', 'Service', 'Online Verification', 'Comment', 'Fashion supply', 'Analyst', 'Date'],
    service: veterinaryEcosystemService,
  },
  {
    key: 'hygiene',
    name: 'Hygiene & Wellness',
    table: 'hygiene_products',
    color: 'text-teal-600 dark:text-teal-400',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400',
    description: 'Medicated shampoos, grooming kits, tick control, oral care & sanitizers',
    fields: ['Product Name', 'Brand Name', 'Product Category', 'Sub Category', 'Pet Type', 'Formulation', 'Dosage', 'Price', 'Pack Size', 'Manufacturer', 'Availability', 'Rating', 'Reviews Count', 'Product Link', 'Product URL', 'Status'],
    service: hygieneService,
  },
  {
    key: 'food',
    name: 'Food & Nutrition',
    table: 'food_products',
    color: 'text-amber-600 dark:text-amber-400',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    description: 'Veterinary prescription diets, life-stage kibble, supplements & natural treats',
    fields: ['Product Name', 'Brand Name', 'Product Category', 'Sub Category', 'Pet Type', 'Life Stage', 'Breed Size', 'Dietary Type', 'Formulation', 'Pack Size', 'Price', 'Manufacturer', 'Availability', 'Rating', 'Reviews Count', 'Website / Marketplace', 'Product URL', 'Source URL', 'Address'],
    service: foodService,
  },
  {
    key: 'accessories',
    name: 'Accessories & Supplies',
    table: 'accessories',
    color: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    description: 'Orthopedic bedding, GPS collars, ergonomic harnesses, crates & toys',
    fields: ['Business Name', 'Category', 'Sub Category', 'Pet Type', 'Product Description', 'Price', 'Availability', 'Review Count', 'Website', 'Product URL'],
    service: accessoryService,
  },
  {
    key: 'service-network',
    name: 'Service Network',
    table: 'service_network',
    color: 'text-sky-600 dark:text-sky-400',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
    description: 'Pet ambulance fleets, mobile grooming vans, luxury boarding & pet resorts',
    fields: ['Business Name', 'Service Type', 'State', 'District / Region', 'Area', 'Address', 'City / Region', 'Contact Number', 'Website / Social Media', 'Rating', 'Google Maps / Source URL', 'Booking URL / Booking Contact'],
    service: serviceNetworkService,
  },
  {
    key: 'doctors',
    name: 'Doctor Directory',
    table: 'doctors',
    color: 'text-cyan-600 dark:text-cyan-400',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
    description: 'Licensed surgeons, veterinarians, exotic specialists & consultation hours',
    fields: ['Doctor Name', 'Qualification', 'Specialist', 'Experience', 'Location', 'Hospital', 'Address', 'Fee', 'Working hrs', 'Doctor URL'],
    service: doctorService,
  },
  {
    key: 'welfare',
    name: 'Animal Welfare Network',
    table: 'welfare_network',
    color: 'text-rose-600 dark:text-rose-400',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    description: 'Non-profit animal shelters, stray rescue response teams & foster networks',
    fields: ['Business Name', 'Service Type', 'State', 'District / Region', 'Area', 'Address', 'City / Region', 'Contact Number', 'Website / Social Media', 'Rating', 'Google Maps / Source URL', 'Booking URL / Booking Contact'],
    service: welfareNetworkService,
  },
];

export const ExcelManagementPage: React.FC = () => {
  const toast = useToast();
  const [activeModule, setActiveModule] = useState<ModuleConfig | null>(null);
  const [modalMode, setModalMode] = useState<'import' | 'export' | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  const handleOpenImport = (mod: ModuleConfig) => {
    setActiveModule(mod);
    setModalMode('import');
  };

  const handleOpenExport = (mod: ModuleConfig) => {
    setActiveModule(mod);
    setModalMode('export');
  };

  const filteredModules = MODULES.filter((m) =>
    m.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.table.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-[26px] border-[1.5px] border-cyan-400/80 bg-gradient-to-r from-[#021822] via-[#042838] to-[#031d2c] p-6 sm:p-8 lg:p-10 shadow-[0_0_35px_rgba(6,182,212,0.25)] transition-all">
        {/* Cyber Grid & Ambient Glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 -bottom-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#22d3ee_1px,transparent_1px)] [background-size:20px_20px]" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-8">
          <div className="max-w-2xl text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/50 bg-[#052938]/90 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.25)] mb-3 sm:mb-4">
              <Layers className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-cyan-200 uppercase">
                SIMPLE AND SECURE PROCESSING
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Centralized Excel Data Hub
            </h1>

            {/* Description */}
            <p className="mt-3 text-xs sm:text-sm text-cyan-100/80 leading-relaxed font-normal">
              Easily upload and manage various HR or entity management related Excel files—data, preventive, or non-service records—and process them securely right inside. Get convenience with simplified data structure and instant insights.
            </p>
          </div>

          {/* Right Hologram Visual */}
          <div className="relative flex-shrink-0 w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.35)] group">
              <img
                src="/assets/excel_hub_3d.jpg"
                alt="Centralized Excel Data Hub"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021822]/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Two-Phase Import Safety */}
        <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-emerald-400/60 bg-gradient-to-br from-[#032420]/95 via-[#021b18]/95 to-[#01100e]/95 p-4 sm:p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(16,185,129,0.18)] backdrop-blur-md transition-all hover:border-emerald-400 group">
          {/* Subtle curved background glow */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-36 h-20 bg-gradient-to-b from-emerald-400/10 via-emerald-500/5 to-transparent rotate-12 pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl border-[1.5px] border-emerald-400/60 bg-[#06332b] flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
              Two-Phase Import Safety
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed mt-1">
              Import preview and confirmation ensure higher accuracy with better data validation.
            </p>
          </div>
        </div>

        {/* Card 2: Excel Field Preservation */}
        <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-cyan-400/60 bg-gradient-to-br from-[#032133]/95 via-[#021826]/95 to-[#01101b]/95 p-4 sm:p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(6,182,212,0.18)] backdrop-blur-md transition-all hover:border-cyan-400 group">
          {/* Subtle curved background glow */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-36 h-20 bg-gradient-to-b from-cyan-400/10 via-cyan-500/5 to-transparent rotate-12 pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl border-[1.5px] border-cyan-400/60 bg-[#062b3f] flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105">
            <FileSpreadsheet className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
              Excel Field Preservation
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed mt-1">
              Keep original Excel headers and data types as-is for full flexibility and reliability.
            </p>
          </div>
        </div>

        {/* Card 3: 3-Way Export Support */}
        <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-indigo-400/60 bg-gradient-to-br from-[#1a133b]/95 via-[#120d2b]/95 to-[#0c081e]/95 p-4 sm:p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(129,140,248,0.18)] backdrop-blur-md transition-all hover:border-indigo-400 group">
          {/* Subtle curved background glow */}
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-0 top-0 w-36 h-20 bg-gradient-to-b from-indigo-400/10 via-indigo-500/5 to-transparent rotate-12 pointer-events-none" />

          <div className="w-12 h-12 rounded-2xl border-[1.5px] border-indigo-400/60 bg-[#25174f] flex items-center justify-center text-indigo-300 shadow-[0_0_15px_rgba(165,180,252,0.3)] flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-105">
            <List className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm sm:text-[15px] font-bold text-white tracking-tight">
              3-Way Export Support
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed mt-1">
              Export processed Excel files in data, preventive, or non-service category as needed for external tools.
            </p>
          </div>
        </div>
      </div>

      {/* Module Grid Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Module Operations ({filteredModules.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose an operational dataset below to import new entries or download reports
            </p>
          </div>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter modules..."
            className="w-full sm:w-64 px-3.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:bg-white dark:focus:bg-slate-800/80 focus:ring-2 focus:ring-emerald-500/25"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredModules.map((mod) => (
            <div
              key={mod.key}
              className="p-5 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl rounded-3xl border border-white/80 dark:border-slate-800/80 shadow-md shadow-slate-200/30 dark:shadow-black/40 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${mod.iconBg}`}>
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {mod.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        table: {mod.table}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${mod.badgeBg}`}>
                    {mod.fields.length} Columns
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2">
                  {mod.description}
                </p>

                {/* Column schema pills */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Excel Headers:
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                    {mod.fields.map((f) => (
                      <span
                        key={f}
                        className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300 font-mono"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenImport(mod)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-500" />
                  Import Excel
                </button>
                <button
                  onClick={() => handleOpenExport(mod)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export XLSX
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Import Modal */}
      {activeModule && modalMode === 'import' && (
        <ExcelImportModal
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setActiveModule(null);
          }}
          moduleName={activeModule.name}
          moduleKey={activeModule.key}
          onPreview={(f) => activeModule.service.previewExcel(f)}
          onConfirm={(r) => activeModule.service.confirmImport(r)}
          onSuccess={() => {
            toast.success(`Successfully imported data for ${activeModule.name}`);
          }}
        />
      )}

      {/* Active Export Modal */}
      {activeModule && modalMode === 'export' && (
        <ExcelExportModal
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setActiveModule(null);
          }}
          moduleName={activeModule.name}
          totalCount={100}
          filteredCount={100}
          selectedCount={0}
          onExport={async (req) => {
            await activeModule.service.exportExcel(req);
          }}
        />
      )}
    </div>
  );
};
