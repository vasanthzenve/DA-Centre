// Common API & Pagination Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  nextCursor?: number | null;
  prevCursor?: number | null;
  hasMore?: boolean;
}

export interface FilterParams {
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  cursor?: number;
  direction?: 'next' | 'prev';
  [key: string]: string | number | boolean | undefined;
}

// Module 1: Market Research
export interface MarketResearch {
  id?: number;
  States?: string;
  Company: string;
  Founded?: string;
  Cities?: string;
  Model?: string;
  Scale?: string;
  Funding?: string;
  Service?: string;
  Revenue?: string;
  "Target Segment"?: string;
  Price?: string | number;
  Product?: string;
  Technology?: string;
  createdAt?: string;
  updatedAt?: string;
  // convenient aliases
  states?: string;
  company?: string;
  founded?: string;
  cities?: string;
  model?: string;
  scale?: string;
  funding?: string;
  service?: string;
  revenue?: string;
  targetSegment?: string;
  price?: string | number;
  product?: string;
  technology?: string;
}

// Module 2: Veterinary Ecosystem
export interface VeterinaryEcosystem {
  id?: number;
  State?: string;
  City?: string;
  Area?: string;
  "Hospital Name": string;
  Address?: string;
  "Phone Number"?: string;
  Website?: string;
  "Opening Hours"?: string;
  Rating?: number;
  Reviews?: number;
  "Business Status"?: string;
  "Google Maps"?: string;
  "Place ID"?: string;
  Service?: string;
  "Online Verification"?: string;
  Comment?: string;
  "Fashion supply"?: string;
  Analyst?: string;
  Date?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  state?: string;
  city?: string;
  area?: string;
  hospitalName?: string;
  address?: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string;
  rating?: number;
  reviews?: number;
  businessStatus?: string;
  googleMaps?: string;
  placeId?: string;
  service?: string;
  onlineVerification?: string;
  comment?: string;
  fashionSupply?: string;
  analyst?: string;
  date?: string;
}

// Module 3.1: Hygiene Products
export interface HygieneProduct {
  id?: number;
  "Product Name": string;
  "Brand Name"?: string;
  "Product Category"?: string;
  "Sub Category"?: string;
  "Pet Type"?: string;
  Formulation?: string;
  Dosage?: string;
  Price?: number;
  "Pack Size"?: string;
  Manufacturer?: string;
  Availability?: string;
  Rating?: number;
  "Reviews Count"?: number;
  "Product Link"?: string;
  "Product URL"?: string;
  Status?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  productName?: string;
  brandName?: string;
  productCategory?: string;
  subCategory?: string;
  petType?: string;
  formulation?: string;
  dosage?: string;
  price?: number;
  packSize?: string;
  manufacturer?: string;
  availability?: string;
  rating?: number;
  reviewsCount?: number;
  productLink?: string;
  productUrl?: string;
  status?: string;
}

// Module 3.2: Food Products
export interface FoodProduct {
  id?: number;
  "Product Name": string;
  "Brand Name"?: string;
  "Product Category"?: string;
  "Sub Category"?: string;
  "Pet Type"?: string;
  "Life Stage"?: string;
  "Breed Size"?: string;
  "Dietary Type"?: string;
  Formulation?: string;
  "Pack Size"?: string;
  Price?: number;
  Manufacturer?: string;
  Availability?: string;
  Rating?: number;
  "Reviews Count"?: number;
  "Website / Marketplace"?: string;
  "Product URL"?: string;
  "Source URL"?: string;
  Address?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  productName?: string;
  brandName?: string;
  productCategory?: string;
  subCategory?: string;
  petType?: string;
  lifeStage?: string;
  breedSize?: string;
  dietaryType?: string;
  formulation?: string;
  packSize?: string;
  price?: number;
  manufacturer?: string;
  availability?: string;
  rating?: number;
  reviewsCount?: number;
  websiteMarketplace?: string;
  productUrl?: string;
  sourceUrl?: string;
  address?: string;
}

// Module 3.3: Accessories
export interface Accessory {
  id?: number;
  "Business Name": string;
  Category?: string;
  "Sub Category"?: string;
  "Pet Type"?: string;
  "Product Description"?: string;
  Price?: number;
  Availability?: string;
  "Review Count"?: number;
  Website?: string;
  "Product URL"?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  businessName?: string;
  category?: string;
  subCategory?: string;
  petType?: string;
  productDescription?: string;
  price?: number;
  availability?: string;
  reviewCount?: number;
  website?: string;
  productUrl?: string;
}

// Module 4: Service Network
export interface ServiceNetwork {
  id?: number;
  "Business Name": string;
  "Service Type"?: string;
  State?: string;
  "District / Region"?: string;
  Area?: string;
  Address?: string;
  "City / Region"?: string;
  "Contact Number"?: string;
  "Website / Social Media"?: string;
  Rating?: number;
  "Google Maps / Source URL"?: string;
  "Booking URL / Booking Contact"?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  businessName?: string;
  serviceType?: string;
  state?: string;
  districtRegion?: string;
  area?: string;
  address?: string;
  cityRegion?: string;
  contactNumber?: string;
  websiteSocialMedia?: string;
  rating?: number;
  googleMapsSourceUrl?: string;
  bookingUrlContact?: string;
}

// Module 5: Doctor
export interface Doctor {
  id?: number;
  "Doctor Name": string;
  Qualification?: string;
  Specialist?: string;
  Experience?: string;
  Location?: string;
  Hospital?: string;
  Address?: string;
  Fee?: number;
  "Working hrs"?: string;
  "Doctor URL"?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  doctorName?: string;
  qualification?: string;
  specialist?: string;
  experience?: string;
  location?: string;
  hospital?: string;
  address?: string;
  fee?: number;
  workingHours?: string;
  doctorUrl?: string;
}

// Module 6: Welfare Network
export interface WelfareNetwork {
  id?: number;
  "Business Name": string;
  "Service Type"?: string;
  State?: string;
  "District / Region"?: string;
  Area?: string;
  Address?: string;
  "City / Region"?: string;
  "Contact Number"?: string;
  "Website / Social Media"?: string;
  Rating?: number;
  "Google Maps / Source URL"?: string;
  "Booking URL / Booking Contact"?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  businessName?: string;
  serviceType?: string;
  state?: string;
  districtRegion?: string;
  area?: string;
  address?: string;
  cityRegion?: string;
  contactNumber?: string;
  websiteSocialMedia?: string;
  rating?: number;
  googleMapsSourceUrl?: string;
  bookingUrlContact?: string;
}

// Excel Types
export interface InvalidRowInfo {
  rowNumber: number;
  errors: string[];
  rowData: Record<string, any>;
}

export interface ExcelPreviewResponse {
  sheetName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  detectedHeaders: string[];
  previewRows: Record<string, any>[];
  invalidRows: InvalidRowInfo[];
}

export interface ExportRequest {
  scope: "all" | "filtered" | "selected";
  selectedIds?: number[];
  filters?: Record<string, string>;
  search?: string;
  format?: "xlsx" | "csv";
}

export interface JobInfo {
  jobId: string;
  module: string;
  jobType: "IMPORT" | "EXPORT";
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  format: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  progressPercent: number;
  message?: string;
  fileName?: string;
  downloadUrl?: string;
  errors?: string[];
  createdAt?: string;
  completedAt?: string;
}

// Dashboard Types
export interface ChartItem {
  name: string;
  value: number;
  extra?: string | null;
}

export interface ActivityItem {
  id: string;
  module: string;
  title: string;
  action: string;
  user: string;
  timestamp: string;
}

export interface DashboardStats {
  totalMarketResearch: number;
  totalVeterinaryHospitals: number;
  totalHygieneProducts: number;
  totalFoodProducts: number;
  totalAccessories: number;
  totalServices: number;
  totalDoctors: number;
  totalWelfareOrganizations: number;
  researchByState: ChartItem[];
  hospitalsByCity: ChartItem[];
  marketplaceByCategory: ChartItem[];
  doctorsBySpecialist: ChartItem[];
  servicesByRegion: ChartItem[];
  welfareByState: ChartItem[];
  recentActivity: ActivityItem[];
}
