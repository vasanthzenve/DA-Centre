import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  Stethoscope,
  HeartHandshake,
  FileSpreadsheet,
  BarChart3,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  X,
  Search,
  Sparkles,
  UtensilsCrossed,
  Shirt,
  Database,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

// Custom 3D Isometric Server & Chart Graphic for the Database Status card
const IsometricServerGraphic: React.FC = () => (
  <svg
    viewBox="0 0 160 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(37,99,235,0.18)]"
  >
    <defs>
      <linearGradient id="topFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93C5FD" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
      <linearGradient id="leftFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="rightFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
    </defs>

    {/* Soft glow background */}
    <ellipse cx="110" cy="70" rx="42" ry="24" fill="#38BDF8" fillOpacity="0.18" />

    {/* Server Stack - Unit 1 (Top) */}
    <g>
      {/* Top face */}
      <polygon points="112,18 144,34 112,50 80,34" fill="url(#topFaceGrad)" />
      {/* Left face */}
      <polygon points="80,34 112,50 112,65 80,49" fill="url(#leftFaceGrad)" />
      {/* Right face */}
      <polygon points="112,50 144,34 144,49 112,65" fill="url(#rightFaceGrad)" />
      {/* Front LEDs / Slots on Left Face */}
      <line x1="86" y1="41" x2="104" y2="50" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="45" x2="98" y2="51" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      {/* Indicator dots on Right Face */}
      <circle cx="120" cy="54" r="1.5" fill="#34D399" />
      <circle cx="126" cy="51" r="1.5" fill="#60A5FA" />
      <circle cx="132" cy="48" r="1.5" fill="#38BDF8" />
    </g>

    {/* Server Stack - Unit 2 (Middle) */}
    <g>
      {/* Left face */}
      <polygon points="80,52 112,68 112,83 80,67" fill="url(#leftFaceGrad)" />
      {/* Right face */}
      <polygon points="112,68 144,52 144,67 112,83" fill="url(#rightFaceGrad)" />
      {/* LEDs */}
      <line x1="86" y1="59" x2="104" y2="68" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="63" x2="98" y2="69" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="120" cy="72" r="1.5" fill="#34D399" />
      <circle cx="126" cy="69" r="1.5" fill="#60A5FA" />
      <circle cx="132" cy="66" r="1.5" fill="#38BDF8" />
    </g>

    {/* Server Stack - Unit 3 (Bottom) */}
    <g>
      {/* Left face */}
      <polygon points="80,70 112,86 112,101 80,85" fill="#1D4ED8" />
      {/* Right face */}
      <polygon points="112,86 144,70 144,85 112,101" fill="#1E3A8A" />
      {/* LEDs */}
      <line x1="86" y1="77" x2="104" y2="86" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <line x1="86" y1="81" x2="96" y2="86" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="120" cy="90" r="1.5" fill="#34D399" />
      <circle cx="126" cy="87" r="1.5" fill="#60A5FA" />
    </g>

    {/* 3D Isometric Ascending Bar Charts in Foreground */}
    {/* Bar 1 (Shortest - Left) */}
    <g>
      <polygon points="46,80 54,84 54,102 46,98" fill="#0891B2" />
      <polygon points="54,84 62,80 62,98 54,102" fill="#0E7490" />
      <polygon points="46,80 54,76 62,80 54,84" fill="#67E8F9" />
    </g>

    {/* Bar 2 (Medium - Center) */}
    <g>
      <polygon points="56,66 64,70 64,102 56,98" fill="#0284C7" />
      <polygon points="64,70 72,66 72,98 64,102" fill="#0369A1" />
      <polygon points="56,66 64,62 72,66 64,70" fill="#38BDF8" />
    </g>

    {/* Bar 3 (Tallest - Right) */}
    <g>
      <polygon points="66,50 74,54 74,102 66,98" fill="#2563EB" />
      <polygon points="74,54 82,50 82,98 74,102" fill="#1D4ED8" />
      <polygon points="66,50 74,46 82,50 74,54" fill="#93C5FD" />
    </g>
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [marketplaceOpen, setMarketplaceOpen] = useState(
    location.pathname.startsWith("/marketplace")
  );
  const [excelOpen, setExcelOpen] = useState(
    location.pathname.startsWith("/excel-management")
  );

  // Auto-expand submenus when navigating into them
  useEffect(() => {
    if (location.pathname.startsWith("/marketplace")) {
      setMarketplaceOpen(true);
    }
    if (location.pathname.startsWith("/excel-management")) {
      setExcelOpen(true);
    }
  }, [location.pathname]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isCurrentActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Filter helper for search
  const matchesSearch = (title: string, subtitle?: string) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      title.toLowerCase().includes(q) ||
      (subtitle && subtitle.toLowerCase().includes(q))
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white/75 dark:bg-[#0A0F1D]/75 backdrop-blur-2xl flex flex-col shadow-[4px_0_30px_rgba(0,0,0,0.03)] border-r border-white/60 dark:border-slate-800/80 transition-all duration-300 ease-in-out select-none ${isCollapsed ? "w-20" : "w-72"
          } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* ================================================================= */}
        {/* 1. BRAND HEADER                                                   */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between px-3.5 pt-4 pb-3 flex-shrink-0">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 overflow-hidden cursor-pointer group"
          >
            {/* Blue Squircle Logo with chart line & bars */}
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0 group-hover:scale-[1.03] transition-transform">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* 3 ascending rounded vertical bars */}
                <rect x="4" y="13" width="2.8" height="7" rx="1.2" fill="currentColor" stroke="none" />
                <rect x="9.6" y="9" width="2.8" height="11" rx="1.2" fill="currentColor" stroke="none" />
                <rect x="15.2" y="5" width="2.8" height="15" rx="1.2" fill="currentColor" stroke="none" />
                {/* Upward trending line chart */}
                <path d="M4 12 L9.6 7 L15.2 10.5 L20.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.5 4.5 H20.5 V8.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col leading-none truncate">
                <div className="flex items-baseline gap-1">
                  <span className="text-[20px] font-black tracking-tight text-slate-900 dark:text-white">
                    DA
                  </span>
                  <span className="text-[20px] font-black tracking-tight text-[#2563EB]">
                    Centre
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 mt-1">
                  ECOSYSTEM &amp; BI
                </span>
                <span className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-slate-400/90 mt-1">
                  DATA · ANALYTICS · RESEARCH · INSIGHTS
                </span>
              </div>
            )}
          </div>

          {/* Toggle / Collapse Button */}
          <button
            onClick={isMobileOpen ? onCloseMobile : onToggleCollapse}
            className="w-8 h-8 rounded-full border border-slate-200/90 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center justify-center flex-shrink-0 transition-colors shadow-2xs"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isMobileOpen ? (
              <X className="w-4 h-4" />
            ) : isCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. SEARCH INPUT                                                   */}
        {/* ================================================================= */}
        {!isCollapsed && (
          <div className="px-3 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 focus-within:border-blue-500 focus-within:bg-white/95 dark:focus-within:bg-slate-800/95 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search menu..."
                className="w-full bg-transparent text-[13px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <kbd className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-400 shadow-2xs">
                    Ctrl
                  </kbd>
                  <kbd className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 text-slate-400 shadow-2xs">
                    K
                  </kbd>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* 3. NAVIGATION MENU                                                */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin">
          {/* Dashboard Item */}
          {matchesSearch("Dashboard", "Overview & Insights") && (
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-md shadow-blue-500/25"
                  : "hover:bg-white/60 dark:hover:bg-slate-800/50 backdrop-blur-xs"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isActive
                      ? "bg-white/20 text-white"
                      : "bg-blue-50/80 dark:bg-blue-950/60 text-[#2563EB]"
                      }`}
                  >
                    <Home className="w-5 h-5" />
                  </div>

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[13.5px] font-bold truncate ${isActive
                          ? "text-white"
                          : "text-slate-800 dark:text-slate-200"
                          }`}
                      >
                        Dashboard
                      </p>
                      <p
                        className={`text-[11px] font-medium truncate ${isActive
                          ? "text-blue-100"
                          : "text-slate-400 dark:text-slate-500"
                          }`}
                      >
                        Overview &amp; Insights
                      </p>
                    </div>
                  )}

                  {!isCollapsed && (
                    <ChevronRight
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-white/80" : "text-slate-300 dark:text-slate-600"
                        }`}
                    />
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      Dashboard
                    </div>
                  )}
                </>
              )}
            </NavLink>
          )}

          {/* =============================================================== */}
          {/* SECTION: CORE MODULES                                           */}
          {/* =============================================================== */}
          <div className="flex items-center gap-2 px-3 pt-3.5 pb-1">
            {!isCollapsed ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  CORE MODULES
                </span>
                <div className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800" />
              </>
            ) : (
              <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800 my-1" />
            )}
          </div>

          {/* 1. Planning & Research */}
          {matchesSearch("Planning & Research", "Market Intelligence") && (
            <SidebarItem
              to="/market-research"
              label="Planning & Research"
              sub="Market Intelligence"
              isCollapsed={isCollapsed}
              iconBg="bg-blue-50 dark:bg-blue-950/60"
              icon={
                <svg
                  className="w-5 h-5 text-[#2563EB]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="M8 17l3-3 2 2 3-4" />
                </svg>
              }
            />
          )}

          {/* 2. Veterinary Hospitals */}
          {matchesSearch("Veterinary Hospitals", "Hospital Directory") && (
            <SidebarItem
              to="/veterinary-ecosystem"
              label="Veterinary Hospitals"
              sub="Hospital Directory"
              isCollapsed={isCollapsed}
              iconBg="bg-emerald-50 dark:bg-emerald-950/60"
              icon={
                <svg
                  className="w-5 h-5 text-[#059669]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  <path d="M12 7v6" />
                  <path d="M9 10h6" />
                </svg>
              }
            />
          )}

          {/* 3. Marketplace (Collapsible with "New" badge) */}
          {matchesSearch("Marketplace", "Products & Services") && (
            <div>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    navigate("/marketplace/hygiene");
                  } else {
                    setMarketplaceOpen(!marketplaceOpen);
                  }
                }}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${isCurrentActive("/marketplace")
                  ? "bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-700 dark:text-blue-300 shadow-2xs"
                  : "hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent"
                  }`}
              >
                {/* Active Indicator Bar on Left */}
                {isCurrentActive("/marketplace") && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#2563EB] to-indigo-600 rounded-r-md shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                )}

                <div className="w-10 h-10 rounded-xl bg-orange-500/15 dark:bg-orange-950/60 border border-orange-500/25 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-5 h-5 text-[#EA580C] dark:text-orange-400" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[13px] font-bold truncate ${isCurrentActive("/marketplace")
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-800 dark:text-slate-200"
                          }`}
                      >
                        Marketplace
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 dark:bg-orange-950/80 text-[#EA580C] dark:text-orange-300 border border-orange-500/25">
                        New
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      Products &amp; Services
                    </p>
                  </div>
                )}

                {!isCollapsed && (
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${marketplaceOpen
                      ? "rotate-180 text-[#2563EB]"
                      : isCurrentActive("/marketplace")
                        ? "text-[#2563EB]"
                        : "text-slate-300 dark:text-slate-600"
                      }`}
                  />
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Marketplace
                  </div>
                )}
              </button>

              {/* Sub-menu */}
              {!isCollapsed && marketplaceOpen && (
                <div className="mt-1 pl-4 space-y-0.5 pb-1 ml-5 border-l-2 border-slate-200/80 dark:border-slate-800">
                  <SubLink to="/marketplace/hygiene">
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                    <span>Hygiene Products</span>
                  </SubLink>
                  <SubLink to="/marketplace/food">
                    <UtensilsCrossed className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                    <span>Food Products</span>
                  </SubLink>
                  <SubLink to="/marketplace/accessories">
                    <Shirt className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500" />
                    <span>Accessories</span>
                  </SubLink>
                </div>
              )}
            </div>
          )}

          {/* 4. Service Network */}
          {matchesSearch("Service Network", "Service Providers") && (
            <SidebarItem
              to="/service-network"
              label="Service Network"
              sub="Service Providers"
              isCollapsed={isCollapsed}
              iconBg="bg-purple-500/15 dark:bg-purple-950/60 border border-purple-500/25"
              icon={
                <svg
                  className="w-5 h-5 text-[#9333EA] dark:text-purple-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              }
            />
          )}

          {/* 5. Doctor Directory */}
          {matchesSearch("Doctor Directory", "Veterinary Professionals") && (
            <SidebarItem
              to="/doctors"
              label="Doctor Directory"
              sub="Veterinary Professionals"
              isCollapsed={isCollapsed}
              iconBg="bg-rose-500/15 dark:bg-rose-950/60 border border-rose-500/25"
              icon={<Stethoscope className="w-5 h-5 text-[#E11D48] dark:text-rose-400" />}
            />
          )}

          {/* 6. Welfare Network */}
          {matchesSearch("Welfare Network", "NGOs & Support Services") && (
            <SidebarItem
              to="/welfare-network"
              label="Welfare Network"
              sub="NGOs & Support Services"
              isCollapsed={isCollapsed}
              iconBg="bg-pink-500/15 dark:bg-pink-950/60 border border-pink-500/25"
              icon={<HeartHandshake className="w-5 h-5 text-[#DB2777] dark:text-pink-400" />}
            />
          )}

          {/* =============================================================== */}
          {/* SECTION: OPERATIONS                                             */}
          {/* =============================================================== */}
          <div className="flex items-center gap-2 px-3 pt-3.5 pb-1">
            {!isCollapsed ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  OPERATIONS
                </span>
                <div className="flex-1 h-px bg-slate-200/80 dark:bg-slate-800" />
              </>
            ) : (
              <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800 my-1" />
            )}
          </div>

          {/* 7. Excel Management (Collapsible) */}
          {matchesSearch("Excel Management", "Import / Export / Bulk Upload") && (
            <div>
              <button
                onClick={() => {
                  if (isCollapsed) {
                    navigate("/excel-management");
                  } else {
                    setExcelOpen(!excelOpen);
                  }
                }}
                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${isCurrentActive("/excel-management")
                  ? "bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-700 dark:text-blue-300 shadow-2xs"
                  : "hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent"
                  }`}
              >
                {/* Active Indicator Bar on Left */}
                {isCurrentActive("/excel-management") && (
                  <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#2563EB] to-indigo-600 rounded-r-md shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                )}

                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 dark:bg-emerald-950/60 border border-emerald-500/25 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5 text-[#059669] dark:text-emerald-400" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <span
                      className={`text-[13px] font-bold block truncate ${isCurrentActive("/excel-management")
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-800 dark:text-slate-200"
                        }`}
                    >
                      Excel Management
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      Import / Export / Bulk Upload
                    </p>
                  </div>
                )}

                {!isCollapsed && (
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${excelOpen
                      ? "rotate-180 text-[#2563EB]"
                      : isCurrentActive("/excel-management")
                        ? "text-[#2563EB]"
                        : "text-slate-300 dark:text-slate-600"
                      }`}
                  />
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Excel Management
                  </div>
                )}
              </button>

              {!isCollapsed && excelOpen && (
                <div className="mt-1 pl-4 space-y-0.5 pb-1 ml-5 border-l-2 border-slate-200/80 dark:border-slate-800">
                  <SubLink to="/excel-management?tab=import">
                    <span>Import Excel</span>
                  </SubLink>
                  <SubLink to="/excel-management?tab=export">
                    <span>Export Excel</span>
                  </SubLink>
                </div>
              )}
            </div>
          )}

          {/* 8. Reports & BI */}
          {matchesSearch("Reports & BI", "Analytics & Insights") && (
            <SidebarItem
              to="/reports"
              label="Reports & BI"
              sub="Analytics & Insights"
              isCollapsed={isCollapsed}
              iconBg="bg-blue-500/15 dark:bg-blue-950/60 border border-blue-500/25"
              icon={<BarChart3 className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />}
            />
          )}

          <div className="h-2" />
        </div>

        {/* ================================================================= */}
        {/* 4. DATABASE STATUS CARD                                           */}
        {/* ================================================================= */}
        {!isCollapsed ? (
          <div className="mx-3.5 mb-3.5 mt-1 flex-shrink-0">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 via-blue-50/70 to-indigo-50/70 dark:from-slate-850/80 dark:via-slate-800/70 dark:to-indigo-950/40 backdrop-blur-xl border border-white/80 dark:border-slate-700/70 p-3.5 shadow-md shadow-blue-500/5">
              {/* Isometric 3D Server & Bar Chart Graphic on the right */}
              <div className="absolute -right-2 -bottom-2 w-36 h-28 pointer-events-none select-none opacity-85">
                <IsometricServerGraphic />
              </div>

              {/* Status Header */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                  </span>
                  <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                    Database Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-4.5 mb-2.5">
                  veterinary_research (3306)
                </p>

                {/* Divider Line */}
                <div className="h-px bg-blue-200/60 dark:bg-slate-700 my-2" />

                {/* 3 Metrics Columns */}
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  <div className="text-left">
                    <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">
                      1.5 Cr+
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                      Load Balanced
                    </p>
                  </div>
                  <div className="text-left pl-2 border-l border-blue-200/70 dark:border-slate-700">
                    <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">
                      99.9%
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                      Uptime
                    </p>
                  </div>
                  <div className="text-left pl-2 border-l border-blue-200/70 dark:border-slate-700">
                    <p className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">
                      23 ms
                    </p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                      Avg Response
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Database Indicator */
          <div className="flex items-center justify-center py-3.5 border-t border-slate-200/80 dark:border-slate-800">
            <div className="group relative">
              <div className="w-10 h-10 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40 flex items-center justify-center">
                <Database className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                DB Connected (3306)
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

/* ========================================================================= */
/* Reusable Navigation Item with active state indicator matching screenshot  */
/* ========================================================================= */
interface SidebarItemProps {
  to: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  label,
  sub,
  icon,
  iconBg,
  badge,
  isCollapsed,
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 ${isActive
        ? "bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-700 dark:text-blue-300 shadow-2xs"
        : "hover:bg-white/60 dark:hover:bg-slate-800/50 border border-transparent"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Active Indicator Bar on Left Edge */}
        {isActive && (
          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-[#2563EB] to-indigo-600 rounded-r-md shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
        )}

        {/* Squircle Icon Container */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${iconBg}`}
        >
          {icon}
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[13px] font-bold truncate ${isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-800 dark:text-slate-200"
                  }`}
              >
                {label}
              </span>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {sub}
            </p>
          </div>
        )}

        {!isCollapsed && (
          <ChevronRight
            className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive
              ? "text-[#2563EB]"
              : "text-slate-300 dark:text-slate-600 group-hover:text-slate-400"
              }`}
          />
        )}

        {isCollapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
            {label}
          </div>
        )}
      </>
    )}
  </NavLink>
);

/* ========================================================================= */
/* Sub-link component for dropdown accordions                                */
/* ========================================================================= */
const SubLink: React.FC<{ to: string; children: React.ReactNode }> = ({
  to,
  children,
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive
        ? "bg-blue-500/10 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 font-bold border border-blue-500/20"
        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/50"
      }`
    }
  >
    {children}
  </NavLink>
);
