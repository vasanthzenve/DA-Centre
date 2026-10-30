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


// Module 7: Fashion Designer
export interface FashionDesigner {
  id?: number;
  Designer_Name: string;
  Brand_Name?: string;
  Specification?: string;
  City?: string;
  State?: string;
  Country?: string;
  Website_Address?: string;
  Official_Email?: string;
  Mobile_Number?: string;
  Pincode?: string;
  Studio_Address?: string;
  Year_of_Establishment?: string;
  "Mobile/website_verification"?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  designerName?: string;
  brandName?: string;
  specification?: string;
  city?: string;
  state?: string;
  country?: string;
  websiteAddress?: string;
  officialEmail?: string;
  mobileNumber?: string;
  pincode?: string;
  studioAddress?: string;
  yearOfEstablishment?: string;
  verificationStatus?: string;
}

// Module 8: Fashion Institute
export interface FashionInstitute {
  id?: number;
  state?: string;
  State?: string;
  City?: string;
  Area?: string;
  Institute_Name: string;
  Address?: string;
  Pincode?: string;
  Phone_No?: string;
  Website?: string;
  Email_ID?: string;
  Map_Location?: string;
  Place_ID?: string;
  Verification_status?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  instituteName?: string;
  city?: string;
  area?: string;
  address?: string;
  pincode?: string;
  phoneNo?: string;
  website?: string;
  emailId?: string;
  mapLocation?: string;
  placeId?: string;
  verificationStatus?: string;
}

// Module 9: Courier Tier 1
export interface CourierTier1 {
  id?: number;
  State?: string;
  City?: string;
  "Company Name": string;
  Address?: string;
  Pincode?: string;
  "Phone Number"?: string;
  Rating?: number;
  Services?: string;
  Website?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  state?: string;
  city?: string;
  companyName?: string;
  address?: string;
  pincode?: string;
  phoneNumber?: string;
  rating?: number;
  services?: string;
  website?: string;
}

// Module 10: Pet Manufacturer
export interface PetManufacturer {
  id?: number;
  country?: string;
  Manufacturer_Name: string;
  Manufacturer_Address?: string;
  Product_Category?: string;
  Mobile_Number?: string;
  Email_ID?: string;
  Website?: string;
  "Export Countries"?: string;
  "Source URL"?: string;
  Verification?: string;
  Analyst?: string;
  command?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  manufacturerName?: string;
  manufacturerAddress?: string;
  productCategory?: string;
  mobileNumber?: string;
  emailId?: string;
  website?: string;
  exportCountries?: string;
  sourceUrl?: string;
  verification?: string;
  analyst?: string;
}

// Module 11: Human and Pet Lab
export interface HumanPetLab {
  id?: number;
  State?: string;
  City?: string;
  Laboratory_Name: string;
  Laboratory_Address?: string;
  Contact_Number?: string;
  Email_ID?: string;
  Laboratory_Type?: string;
  Testing_Services?: string;
  "Animal_Types_Covered_(N/A_for_Human_Labs)"?: string;
  website?: string;
  Google_Maps_Link?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  state?: string;
  city?: string;
  laboratoryName?: string;
  laboratoryAddress?: string;
  contactNumber?: string;
  emailId?: string;
  laboratoryType?: string;
  testingServices?: string;
  animalTypesCovered?: string;
  googleMapsLink?: string;
}

// Module 12: Livestock
export interface Livestock {
  id?: number;
  Name: string;
  Livestock_Type?: string;
  Farm_Type?: string;
  Contact_Number?: string;
  Email?: string;
  Website?: string;
  Address?: string;
  Area?: string;
  District?: string;
  State?: string;
  Pincode?: string;
  Services?: string;
  Rating?: number;
  Reviews_Count?: number;
  Business_Status?: string;
  Google_Maps?: string;
  Source_URL?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  name?: string;
  livestockType?: string;
  farmType?: string;
  contactNumber?: string;
  email?: string;
  website?: string;
  address?: string;
  area?: string;
  district?: string;
  state?: string;
  pincode?: string;
  services?: string;
  rating?: number;
  reviewsCount?: number;
  businessStatus?: string;
  googleMaps?: string;
  sourceUrl?: string;
}

// Module 13: Philippines Pet Products
export interface PhilippinesPetProduct {
  id?: number;
  Country?: string;
  "Product Name": string;
  "Brand Name"?: string;
  "Product Description"?: string;
  "Minimum Price (PHP)"?: number;
  "Maximum Price (PHP)"?: number;
  "Current Selling Price (PHP)"?: number;
  Availability?: string;
  "Marketplace Name"?: string;
  "Product URL"?: string;
  "Product Image URL"?: string;
  "Source URL"?: string;
  Command?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  country?: string;
  productName?: string;
  brandName?: string;
  productDescription?: string;
  minimumPricePhp?: number;
  maximumPricePhp?: number;
  currentSellingPricePhp?: number;
  availability?: string;
  marketplaceName?: string;
  productUrl?: string;
  productImageUrl?: string;
  sourceUrl?: string;
  command?: string;
}

// Module 14: Poultry
export interface Poultry {
  id?: number;
  Name: string;
  Category?: string;
  Sub_Category?: string;
  Phone?: string;
  Website?: string;
  Address?: string;
  Area?: string;
  District?: string;
  State?: string;
  Pincode?: string;
  Business_Tag?: string;
  Rating?: number;
  Reviews?: string;
  Status?: string;
  Source?: string;
  Maps_Link?: string;
  Analyst?: string;
  Notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // aliases
  name?: string;
  category?: string;
  subCategory?: string;
  phone?: string;
  website?: string;
  address?: string;
  area?: string;
  district?: string;
  state?: string;
  pincode?: string;
  businessTag?: string;
  rating?: number;
  reviews?: string;
  status?: string;
  source?: string;
  mapsLink?: string;
  analyst?: string;
  notes?: string;
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
