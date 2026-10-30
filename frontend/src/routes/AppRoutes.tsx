import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/Auth/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { AdminDashboardPage } from '../pages/Admin/AdminDashboardPage';
import { MarketResearchPage } from '../pages/MarketResearch/MarketResearchPage';
import { VeterinaryEcosystemPage } from '../pages/VeterinaryEcosystem/VeterinaryEcosystemPage';
import { HygienePage } from '../pages/Marketplace/HygienePage';
import { FoodPage } from '../pages/Marketplace/FoodPage';
import { AccessoriesPage } from '../pages/Marketplace/AccessoriesPage';
import { ServiceNetworkPage } from '../pages/ServiceNetwork/ServiceNetworkPage';
import { DoctorsPage } from '../pages/Doctors/DoctorsPage';
import { WelfareNetworkPage } from '../pages/WelfareNetwork/WelfareNetworkPage';
import { FashionDesignersPage } from '../pages/FashionDesigners/FashionDesignersPage';
import { FashionInstitutesPage } from '../pages/FashionInstitutes/FashionInstitutesPage';
import { CourierTier1Page } from '../pages/CourierTier1/CourierTier1Page';
import { PetManufacturersPage } from '../pages/PetManufacturers/PetManufacturersPage';
import { HumanPetLabsPage } from '../pages/HumanPetLabs/HumanPetLabsPage';
import { LivestockPage } from '../pages/Livestock/LivestockPage';
import { PhilippinesPetProductsPage } from '../pages/PhilippinesPetProducts/PhilippinesPetProductsPage';
import { PoultryPage } from '../pages/Poultry/PoultryPage';
import { ExcelManagementPage } from '../pages/Excel/ExcelManagementPage';
import { ReportsPage } from '../pages/Reports/ReportsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Console Route - Protected strictly for Admin only */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
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

          {/* New Modules 1 - 4 */}
          <Route path="fashion-designers" element={<FashionDesignersPage />} />
          <Route path="fashion-institutes" element={<FashionInstitutesPage />} />
          <Route path="courier-tier-1" element={<CourierTier1Page />} />
          <Route path="pet-manufacturers" element={<PetManufacturersPage />} />

          {/* New Modules 5 - 8 */}
          <Route path="human-pet-labs" element={<HumanPetLabsPage />} />
          <Route path="livestock" element={<LivestockPage />} />
          <Route path="philippines-pet-products" element={<PhilippinesPetProductsPage />} />
          <Route path="poultry" element={<PoultryPage />} />

          <Route path="excel-management" element={<ExcelManagementPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
