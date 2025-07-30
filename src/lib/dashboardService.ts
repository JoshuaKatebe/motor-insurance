import { QuotesService, Quote } from './quotesService';
import { PoliciesService, Policy } from './policiesService';
import { ClaimsService, Claim } from './claimsService';

export interface DashboardData {
  stats: {
    totalCoverage: number;
    activePolicies: number;
    pendingClaims: number;
    totalQuotes: number;
  };
  recentQuotes: Quote[];
  recentPolicies: Policy[];
  recentClaims: Claim[];
}

export class DashboardService {
  static async getDashboardData(userId: string): Promise<DashboardData> {
    try {
      // Fetch all data in parallel for efficiency
      const [
        policyStats,
        pendingClaimsCount,
        quoteStats,
        recentQuotes,
        recentPolicies,
        recentClaims
      ] = await Promise.all([
        PoliciesService.getPolicyStats(userId),
        ClaimsService.getPendingClaimsCount(userId),
        QuotesService.getQuoteStats(userId),
        QuotesService.getRecentQuotes(userId, 5),
        PoliciesService.getRecentPolicies(userId, 5),
        ClaimsService.getRecentClaims(userId, 5)
      ]);

      // Calculate total coverage from active policies
      const activePolicies = await PoliciesService.getUserPolicies(userId);
      const totalCoverage = activePolicies
        .filter(p => p.status === 'active')
        .reduce((sum, p) => sum + p.premium, 0);

      return {
        stats: {
          totalCoverage,
          activePolicies: policyStats.active,
          pendingClaims: pendingClaimsCount,
          totalQuotes: quoteStats.total,
        },
        recentQuotes,
        recentPolicies,
        recentClaims,
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
}

