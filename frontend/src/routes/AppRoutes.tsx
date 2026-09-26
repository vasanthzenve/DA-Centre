import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { MarketResearchPage } from '../pages/MarketResearch/MarketResearchPage';
import { VeterinaryEcosystemPage } from '../pages/VeterinaryEcosystem/VeterinaryEcosystemPage';
import { HygienePage } from '../pages/Marketplace/HygienePage';
import { FoodPage } from '../pages/Marketplace/FoodPage';
import { AccessoriesPage } from '../pages/Marketplace/AccessoriesPage';
import { ServiceNetworkPage } from '../pages/ServiceNetwork/ServiceNetworkPage';
import { DoctorsPage } from '../pages/Doctors/DoctorsPage';
import { WelfareNetworkPage } from '../pages/WelfareNetwork/WelfareNetworkPage';
import { ExcelManagementPage } from '../pages/Excel/ExcelManagementPage';
import { ReportsPage } from '../pages/Reports/ReportsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="market-research" element={<MarketResearchPage />} />
        <Route path="veterinary-ecosystem" element={<VeterinaryEcosystemPage />} />
        <Route path="marketplace/hygiene" element={<HygienePage />} />
        <Route path="marketplace/food" element={<FoodPage />} />
        <Route path="marketplace/accessories" element={<AccessoriesPage />} />
        <Route path="service-network" element={<ServiceNetworkPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="welfare-network" element={<WelfareNetworkPage />} />
        <Route path="excel-management" element={<ExcelManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
