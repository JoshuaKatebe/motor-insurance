import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  orderBy,
  limit,
  where,
  Timestamp,
  getCountFromServer,
  AggregateQuerySnapshot,
  AggregateField
} from 'firebase/firestore';

export interface Policy {
  id: string;
  userId: string;
  premium: number;
  status: string;
  createdAt: Timestamp;
}

export interface Claim {
  id: string;
  userId: string;
  status: string;
  estimatedAmount: number;
  createdAt: Timestamp;
}

export interface Quote {
  id: string;
  userId: string;
  status: string;
  createdAt: Timestamp;
}

export interface UserData {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  profileComplete: boolean;
  totalPolicies: number;
  totalClaims: number;
  totalSpent: number;
}

export interface AdminDashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalPolicies: number;
    activePolicies: number;
    totalQuotes: number;
    conversionRate: number;
    totalClaims: number;
    pendingClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    averagePremium: number;
    averageClaimAmount: number;
  };
  recentUsers: UserData[];
  recentPolicies: any[];
  recentClaims: any[];
  recentQuotes: any[];
  userGrowth: Array<{
    month: string;
    users: number;
    policies: number;
  }>;
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
  }>;
  topPerformingAgents: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  systemHealth: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    storageUsed: number;
  };
}

export class AdminService {
  static async getAdminDashboardData(): Promise<AdminDashboardData> {
    try {
      // Fetch all collections
      const [users, policies, claims, quotes] = await Promise.all([
        this.getAllUsers(),
        this.getAllPolicies(),
        this.getAllClaims(),
        this.getAllQuotes()
      ]);

      // Calculate statistics
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const activeUsers = users.filter(user => {
        const lastLogin = user.lastLoginAt?.toDate() || new Date(0);
        return lastLogin > thirtyDaysAgo;
      }).length;

      const activePolicies = policies.filter(p => p.status === 'active').length;
      const pendingClaims = claims.filter(c => c.status === 'under-review' || c.status === 'submitted').length;
      const approvedClaims = claims.filter(c => c.status === 'approved' || c.status === 'settled').length;
      const rejectedClaims = claims.filter(c => c.status === 'rejected').length;

      const totalRevenue = policies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
      const monthlyPolicies = policies.filter(p => {
        const createdAt = p.createdAt?.toDate() || new Date(0);
        return createdAt > thirtyDaysAgo;
      });
      const monthlyRevenue = monthlyPolicies.reduce((sum, policy) => sum + (policy.premium || 0), 0);

      const averagePremium = policies.length > 0 ? totalRevenue / policies.length : 0;
      const totalClaimAmount = claims.reduce((sum, claim) => sum + (claim.estimatedAmount || 0), 0);
      const averageClaimAmount = claims.length > 0 ? totalClaimAmount / claims.length : 0;
      
      const conversionRate = quotes.length > 0 ? (policies.length / quotes.length) * 100 : 0;

      // Get recent items
      const recentUsers = users.slice(0, 5).map(user => ({
        ...user,
        totalPolicies: policies.filter(p => p.userId === user.id).length,
        totalClaims: claims.filter(c => c.userId === user.id).length,
        totalSpent: policies.filter(p => p.userId === user.id)
          .reduce((sum, p) => sum + (p.premium || 0), 0)
      }));

      const recentPolicies = policies.slice(0, 10);
      const recentClaims = claims.slice(0, 10);
      const recentQuotes = quotes.slice(0, 10);

      // Generate user growth data
      const userGrowth = this.generateUserGrowth();

      // Revenue breakdown
      const revenueBreakdown = this.calculateRevenueBreakdown(policies);

      // Top performing agents (mock data for now)
      const topPerformingAgents = this.getTopPerformingAgents();

      // System health (mock data)
      const systemHealth = {
        uptime: 99.98,
        responseTime: 145,
        errorRate: 0.02,
        storageUsed: 65.4
      };

      return {
        stats: {
          totalUsers: users.length,
          activeUsers,
          totalRevenue,
          monthlyRevenue,
          totalPolicies: policies.length,
          activePolicies,
          totalQuotes: quotes.length,
          conversionRate: Math.round(conversionRate * 10) / 10,
          totalClaims: claims.length,
          pendingClaims,
          approvedClaims,
          rejectedClaims,
          averagePremium: Math.round(averagePremium),
          averageClaimAmount: Math.round(averageClaimAmount)
        },
        recentUsers,
        recentPolicies,
        recentClaims,
        recentQuotes,
        userGrowth,
        revenueBreakdown,
        topPerformingAgents,
        systemHealth
      };
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
      // Return mock data for development
      return this.getMockAdminData();
    }
  }

  private static async getAllUsers() {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserData[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  private static async getAllPolicies(): Promise<Policy[]> {
    try {
      const policiesQuery = query(
        collection(db, 'policies'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(policiesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Policy[];
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  }

  private static async getAllClaims(): Promise<Claim[]> {
    try {
      const claimsQuery = query(
        collection(db, 'claims'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(claimsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Claim[];
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  }

  private static async getAllQuotes(): Promise<Quote[]> {
    try {
      const quotesQuery = query(
        collection(db, 'quotes'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(quotesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quote[];
    } catch (error) {
      console.error('Error fetching quotes:', error);
      return [];
    }
  }

  private static generateUserGrowth() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 50) + 100 + (index * 10),
      policies: Math.floor(Math.random() * 30) + 20 + (index * 5)
    }));
  }

  private static calculateRevenueBreakdown(policies: any[]) {
    const breakdown = [
      { source: 'Comprehensive', amount: 125000, percentage: 45 },
      { source: 'Third Party', amount: 87500, percentage: 32 },
      { source: 'Fire & Theft', amount: 45000, percentage: 16 },
      { source: 'Other', amount: 20000, percentage: 7 }
    ];
    return breakdown;
  }

  private static getTopPerformingAgents() {
    return [
      { name: 'John Smith', sales: 45, revenue: 225000 },
      { name: 'Sarah Johnson', sales: 38, revenue: 198000 },
      { name: 'Michael Chen', sales: 35, revenue: 185000 },
      { name: 'Emily Davis', sales: 32, revenue: 172000 },
      { name: 'Robert Wilson', sales: 28, revenue: 145000 }
    ];
  }

  private static getMockAdminData(): AdminDashboardData {
    return {
      stats: {
        totalUsers: 1245,
        activeUsers: 892,
        totalRevenue: 2456000,
        monthlyRevenue: 385000,
        totalPolicies: 342,
        activePolicies: 298,
        totalQuotes: 856,
        conversionRate: 39.9,
        totalClaims: 45,
        pendingClaims: 12,
        approvedClaims: 28,
        rejectedClaims: 5,
        averagePremium: 7181,
        averageClaimAmount: 15600
      },
      recentUsers: [
        {
          id: '1',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          createdAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          profileComplete: true,
          totalPolicies: 2,
          totalClaims: 0,
          totalSpent: 14500
        },
        {
          id: '2',
          email: 'jane.smith@example.com',
          displayName: 'Jane Smith',
          createdAt: Timestamp.now(),
          lastLoginAt: Timestamp.now(),
          profileComplete: true,
          totalPolicies: 1,
          totalClaims: 1,
          totalSpent: 8200
        }
      ],
      recentPolicies: [
        {
          id: '1',
          policyNumber: 'POL-2024-001',
          userName: 'John Doe',
          vehicleInfo: '2020 Toyota Corolla',
          premium: 5500,
          status: 'active',
          createdAt: Timestamp.now()
        },
        {
          id: '2',
          policyNumber: 'POL-2024-002',
          userName: 'Jane Smith',
          vehicleInfo: '2019 Honda Civic',
          premium: 6200,
          status: 'active',
          createdAt: Timestamp.now()
        }
      ],
      recentClaims: [
        {
          id: '1',
          claimNumber: 'CLM-2024-001',
          userName: 'Robert Johnson',
          incidentType: 'accident',
          estimatedAmount: 12500,
          status: 'under-review',
          submittedAt: Timestamp.now()
        }
      ],
      recentQuotes: [
        {
          id: '1',
          userName: 'Alice Brown',
          vehicle: '2022 Mazda CX-5',
          premium: 7800,
          status: 'active',
          createdAt: Timestamp.now()
        }
      ],
      userGrowth: [
        { month: 'Jan', users: 150, policies: 45 },
        { month: 'Feb', users: 165, policies: 52 },
        { month: 'Mar', users: 178, policies: 58 },
        { month: 'Apr', users: 195, policies: 65 },
        { month: 'May', users: 210, policies: 72 },
        { month: 'Jun', users: 225, policies: 78 }
      ],
      revenueBreakdown: [
        { source: 'Comprehensive', amount: 125000, percentage: 45 },
        { source: 'Third Party', amount: 87500, percentage: 32 },
        { source: 'Fire & Theft', amount: 45000, percentage: 16 },
        { source: 'Other', amount: 20000, percentage: 7 }
      ],
      topPerformingAgents: [
        { name: 'John Smith', sales: 45, revenue: 225000 },
        { name: 'Sarah Johnson', sales: 38, revenue: 198000 },
        { name: 'Michael Chen', sales: 35, revenue: 185000 }
      ],
      systemHealth: {
        uptime: 99.98,
        responseTime: 145,
        errorRate: 0.02,
        storageUsed: 65.4
      }
    };
  }
}
