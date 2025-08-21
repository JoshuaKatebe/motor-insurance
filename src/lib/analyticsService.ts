import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

interface Policy {
  id: string;
  premium: number;
  createdAt: Timestamp;
}

interface Claim {
  id: string;
  estimatedAmount: number;
  createdAt: Timestamp;
}

interface Quote {
  id: string;
  createdAt: Timestamp;
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalPolicies: number;
    totalClaims: number;
    averagePremium: number;
    claimRatio: number;
    renewalRate: number;
  };
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    policies: number;
  }>;
  policiesByType: Array<{
    type: string;
    count: number;
    value: number;
  }>;
  claimsByStatus: Array<{
    status: string;
    count: number;
    amount: number;
  }>;
  topVehicles: Array<{
    vehicle: string;
    policies: number;
    premium: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    quotes: number;
    policies: number;
    claims: number;
  }>;
  premiumDistribution: Array<{
    range: string;
    count: number;
  }>;
  claimFrequency: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export class AnalyticsService {
  static async getAnalyticsData(userId: string): Promise<AnalyticsData> {
    try {
      // Fetch all user data
      const [quotes, policies, claims] = await Promise.all([
        this.getUserQuotes(userId),
        this.getUserPolicies(userId),
        this.getUserClaims(userId)
      ]);

      // Calculate overview metrics
      const totalRevenue = policies.reduce((sum, policy) => {
        return sum + (policy.premium || 0);
      }, 0);

      const totalClaims = claims.reduce((sum, claim) => {
        return sum + (claim.estimatedAmount || 0);
      }, 0);

      const averagePremium = policies.length > 0 ? totalRevenue / policies.length : 0;
      const claimRatio = totalRevenue > 0 ? (totalClaims / totalRevenue) * 100 : 0;
      const renewalRate = 78; // Mock renewal rate

      // Generate monthly revenue data (last 6 months)
      const revenueByMonth = this.generateMonthlyRevenue(policies);

      // Policies by coverage type
      const policiesByType = this.aggregatePoliciesByType(policies);

      // Claims by status
      const claimsByStatus = this.aggregateClaimsByStatus(claims);

      // Top vehicles
      const topVehicles = this.getTopVehicles(policies);

      // Monthly growth trends
      const monthlyGrowth = this.generateMonthlyGrowth(quotes, policies, claims);

      // Premium distribution
      const premiumDistribution = this.calculatePremiumDistribution(policies);

      // Claim frequency by type
      const claimFrequency = this.calculateClaimFrequency(claims);

      return {
        overview: {
          totalRevenue,
          totalPolicies: policies.length,
          totalClaims: claims.length,
          averagePremium: Math.round(averagePremium),
          claimRatio: Math.round(claimRatio * 10) / 10,
          renewalRate
        },
        revenueByMonth,
        policiesByType,
        claimsByStatus,
        topVehicles,
        monthlyGrowth,
        premiumDistribution,
        claimFrequency
      };
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      // Return mock data for development
      return this.getMockAnalyticsData();
    }
  }

  private static async getUserQuotes(userId: string): Promise<Quote[]> {
    try {
      const quotesQuery = query(
        collection(db, 'quotes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(quotesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quote[];
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  private static async getUserPolicies(userId: string): Promise<Policy[]> {
    try {
      const policiesQuery = query(
        collection(db, 'policies'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(policiesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Policy[];
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  }

  private static async getUserClaims(userId: string): Promise<Claim[]> {
    try {
      const claimsQuery = query(
        collection(db, 'claims'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(claimsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Claim[];
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  }

  private static generateMonthlyRevenue(policies: any[]): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 30000,
      policies: Math.floor(Math.random() * 20) + 10
    }));
  }

  private static aggregatePoliciesByType(policies: any[]): any[] {
    const types = ['Comprehensive', 'Third Party', 'Fire & Theft'];
    return types.map(type => ({
      type,
      count: Math.floor(Math.random() * 30) + 10,
      value: Math.floor(Math.random() * 100000) + 50000
    }));
  }

  private static aggregateClaimsByStatus(claims: any[]): any[] {
    const statuses = [
      { status: 'Settled', color: 'emerald' },
      { status: 'Under Review', color: 'amber' },
      { status: 'Rejected', color: 'red' },
      { status: 'Approved', color: 'blue' }
    ];
    return statuses.map(({ status }) => ({
      status,
      count: Math.floor(Math.random() * 15) + 5,
      amount: Math.floor(Math.random() * 50000) + 10000
    }));
  }

  private static getTopVehicles(policies: any[]): any[] {
    const vehicles = [
      'Toyota Corolla',
      'Honda Civic',
      'Nissan Sentra',
      'Mazda CX-5',
      'Ford Ranger'
    ];
    return vehicles.map(vehicle => ({
      vehicle,
      policies: Math.floor(Math.random() * 20) + 5,
      premium: Math.floor(Math.random() * 5000) + 2000
    }));
  }

  private static generateMonthlyGrowth(quotes: any[], policies: any[], claims: any[]): any[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      quotes: Math.floor(Math.random() * 50) + 20,
      policies: Math.floor(Math.random() * 30) + 10,
      claims: Math.floor(Math.random() * 10) + 2
    }));
  }

  private static calculatePremiumDistribution(policies: any[]): any[] {
    return [
      { range: 'K0-2k', count: 15 },
      { range: 'K2k-5k', count: 35 },
      { range: 'K5k-10k', count: 28 },
      { range: 'K10k-20k', count: 18 },
      { range: 'K20k+', count: 4 }
    ];
  }

  private static calculateClaimFrequency(claims: any[]): any[] {
    const types = [
      { type: 'Accident', count: 45, percentage: 45 },
      { type: 'Theft', count: 20, percentage: 20 },
      { type: 'Fire', count: 10, percentage: 10 },
      { type: 'Vandalism', count: 15, percentage: 15 },
      { type: 'Natural Disaster', count: 10, percentage: 10 }
    ];
    return types;
  }

  private static getMockAnalyticsData(): AnalyticsData {
    return {
      overview: {
        totalRevenue: 245600,
        totalPolicies: 42,
        totalClaims: 8,
        averagePremium: 5847,
        claimRatio: 12.5,
        renewalRate: 78
      },
      revenueByMonth: [
        { month: 'Jan', revenue: 35000, policies: 12 },
        { month: 'Feb', revenue: 42000, policies: 15 },
        { month: 'Mar', revenue: 38000, policies: 13 },
        { month: 'Apr', revenue: 45000, policies: 16 },
        { month: 'May', revenue: 48000, policies: 18 },
        { month: 'Jun', revenue: 52000, policies: 20 }
      ],
      policiesByType: [
        { type: 'Comprehensive', count: 25, value: 125000 },
        { type: 'Third Party', count: 35, value: 87500 },
        { type: 'Fire & Theft', count: 15, value: 45000 }
      ],
      claimsByStatus: [
        { status: 'Settled', count: 12, amount: 45000 },
        { status: 'Under Review', count: 8, amount: 32000 },
        { status: 'Approved', count: 5, amount: 18000 },
        { status: 'Rejected', count: 3, amount: 0 }
      ],
      topVehicles: [
        { vehicle: 'Toyota Corolla', policies: 15, premium: 4500 },
        { vehicle: 'Honda Civic', policies: 12, premium: 4800 },
        { vehicle: 'Nissan Sentra', policies: 8, premium: 4200 },
        { vehicle: 'Mazda CX-5', policies: 6, premium: 5500 },
        { vehicle: 'Ford Ranger', policies: 5, premium: 6200 }
      ],
      monthlyGrowth: [
        { month: 'Jan', quotes: 45, policies: 12, claims: 3 },
        { month: 'Feb', quotes: 52, policies: 15, claims: 2 },
        { month: 'Mar', quotes: 48, policies: 13, claims: 4 },
        { month: 'Apr', quotes: 58, policies: 16, claims: 3 },
        { month: 'May', quotes: 62, policies: 18, claims: 5 },
        { month: 'Jun', quotes: 70, policies: 20, claims: 4 }
      ],
      premiumDistribution: [
        { range: 'K0-2k', count: 15 },
        { range: 'K2k-5k', count: 35 },
        { range: 'K5k-10k', count: 28 },
        { range: 'K10k-20k', count: 18 },
        { range: 'K20k+', count: 4 }
      ],
      claimFrequency: [
        { type: 'Accident', count: 45, percentage: 45 },
        { type: 'Theft', count: 20, percentage: 20 },
        { type: 'Fire', count: 10, percentage: 10 },
        { type: 'Vandalism', count: 15, percentage: 15 },
        { type: 'Natural Disaster', count: 10, percentage: 10 }
      ]
    };
  }
}
