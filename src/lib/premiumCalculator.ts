import { VehicleDetails, CoverageDetails, PremiumCalculation } from '@/types';

const BASE_PREMIUM = 500; // K500
const COVERAGE_FEES = {
  'third-party': 1000,     // K1000
  'comprehensive': 3000,   // K3000
  'fire-theft': 2000,      // K2000
};

const TAX_RATE = 0.03; // 3%
const VEHICLE_AGE_THRESHOLD = 10;
const VEHICLE_AGE_ADJUSTMENT = 100; // K100
const ADDITIONAL_DRIVER_FEE = 200; // K200 per additional driver

export function calculatePremium(
  vehicleDetails: VehicleDetails,
  coverageDetails: CoverageDetails
): PremiumCalculation {
  // Base premium
  const basePremium = BASE_PREMIUM;

  // Coverage fee based on type
  const coverageFee = COVERAGE_FEES[coverageDetails.coverageType];

  // Vehicle age adjustment
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - vehicleDetails.year;
  const vehicleAgeAdjustment = vehicleAge > VEHICLE_AGE_THRESHOLD ? VEHICLE_AGE_ADJUSTMENT : 0;

  // Additional drivers fee
  const additionalDriversFee = coverageDetails.additionalDrivers * ADDITIONAL_DRIVER_FEE;

  // Calculate subtotal
  const subtotal = basePremium + coverageFee + vehicleAgeAdjustment + additionalDriversFee;

  // Calculate tax
  const tax = Math.round(subtotal * TAX_RATE);

  // Calculate total premium
  const totalPremium = subtotal + tax;

  return {
    basePremium,
    coverageFee,
    vehicleAgeAdjustment,
    additionalDriversFee,
    subtotal,
    tax,
    totalPremium,
  };
}

export function formatCurrency(amount: number): string {
  return `K${amount.toLocaleString()}`;
}

export function getPremiumBreakdown(calculation: PremiumCalculation) {
  return [
    { label: 'Base Premium', amount: calculation.basePremium },
    { label: 'Coverage Fee', amount: calculation.coverageFee },
    ...(calculation.vehicleAgeAdjustment > 0 
      ? [{ label: 'Vehicle Age Adjustment', amount: calculation.vehicleAgeAdjustment }] 
      : []
    ),
    ...(calculation.additionalDriversFee > 0 
      ? [{ label: 'Additional Drivers', amount: calculation.additionalDriversFee }] 
      : []
    ),
    { label: 'Subtotal', amount: calculation.subtotal, isSubtotal: true },
    { label: 'Tax (3%)', amount: calculation.tax },
    { label: 'Total Premium', amount: calculation.totalPremium, isTotal: true },
  ];
}
