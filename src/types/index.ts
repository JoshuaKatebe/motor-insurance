export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  licenseNumber: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  engineSize: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  vehicleValue: number;
  color: string;
  chassisNumber: string;
}

export interface CoverageDetails {
  coverageType: 'third-party' | 'comprehensive' | 'fire-theft';
  startDate: string;
  duration: 12 | 6; // months
  additionalDrivers: number;
  voluntaryExcess: number;
}

export interface Quote {
  id: string;
  userId: string;
  personalDetails: PersonalDetails;
  vehicleDetails: VehicleDetails;
  coverageDetails: CoverageDetails;
  premiumCalculation: PremiumCalculation;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface PremiumCalculation {
  basePremium: number;
  coverageFee: number;
  vehicleAgeAdjustment: number;
  additionalDriversFee: number;
  subtotal: number;
  tax: number;
  totalPremium: number;
}

export interface Policy {
  id: string;
  quoteId: string;
  userId: string;
  policyNumber: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  startDate: string;
  endDate: string;
  createdAt: string;
  documents: PolicyDocument[];
}

export interface PolicyDocument {
  id: string;
  type: 'certificate' | 'schedule' | 'terms';
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  claimNumber: string;
  incidentDate: string;
  incidentDescription: string;
  claimType: 'accident' | 'theft' | 'fire' | 'vandalism' | 'natural-disaster';
  estimatedAmount: number;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'settled';
  documents: ClaimDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDocument {
  id: string;
  type: 'police-report' | 'photos' | 'receipts' | 'medical-report' | 'other';
  url: string;
  filename: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  profileComplete: boolean;
  createdAt: string;
  lastLoginAt: string;
}
