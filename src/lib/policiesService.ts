import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Quote } from './quotesService';

export interface Policy {
  id?: string;
  quoteId: string;
  userId: string;
  policyNumber: string;
  vehicleInfo: string; // Formatted string like "2020 Toyota Camry"
  status: 'active' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  premium: number;
  coverageType: string;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const POLICIES_COLLECTION = 'policies';

export class PoliciesService {
  // Generate policy number
  private static generatePolicyNumber(): string {
    const prefix = 'SM';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  // Convert quote to policy
  static async convertQuoteToPolicy(quote: Quote): Promise<string> {
    try {
      const now = Timestamp.now();
      const startDate = new Timestamp(now.seconds, 0);
      const endDate = new Timestamp(now.seconds + (365 * 24 * 60 * 60), 0); // 1 year from now
      
      const policy: Omit<Policy, 'id'> = {
        quoteId: quote.id!,
        userId: quote.userId,
        policyNumber: this.generatePolicyNumber(),
        vehicleInfo: `${quote.year} ${quote.make} ${quote.model}`,
        status: 'active',
        paymentStatus: 'paid',
        premium: quote.premium,
        coverageType: quote.coverageType,
        startDate,
        endDate,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, POLICIES_COLLECTION), policy);
      return docRef.id;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw new Error('Failed to create policy');
    }
  }

  static async getActiveUserPolicies(userId: string): Promise<Policy[]> {
    try {
      const q = query(
        collection(db, POLICIES_COLLECTION),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      const policies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Policy));

      return policies.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    } catch (error) {
      console.error('Error fetching active user policies:', error);
      throw new Error('Failed to fetch active policies');
    }
  }


  // Get all policies for a user
  static async getUserPolicies(userId: string): Promise<Policy[]> {
    try {
      const q = query(
        collection(db, POLICIES_COLLECTION),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const policies = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Policy));
      
      // Sort by createdAt descending (newest first)
      return policies.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    } catch (error) {
      console.error('Error fetching user policies:', error);
      throw new Error('Failed to fetch policies');
    }
  }

  // Get recent policies for dashboard
  static async getRecentPolicies(userId: string, limitCount: number = 5): Promise<Policy[]> {
    try {
      const policies = await this.getUserPolicies(userId);
      return policies.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recent policies:', error);
      throw new Error('Failed to fetch recent policies');
    }
  }

  // Get active policies count
  static async getActivePoliciesCount(userId: string): Promise<number> {
    try {
      const policies = await this.getUserPolicies(userId);
      const now = Timestamp.now();
      
      return policies.filter(policy => 
        policy.status === 'active' && 
        policy.endDate.seconds > now.seconds
      ).length;
    } catch (error) {
      console.error('Error fetching active policies count:', error);
      return 0;
    }
  }

  // Get policy statistics
  static async getPolicyStats(userId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    cancelled: number;
  }> {
    try {
      const policies = await this.getUserPolicies(userId);
      const now = Timestamp.now();

      const stats = {
        total: policies.length,
        active: 0,
        expired: 0,
        cancelled: 0
      };

      policies.forEach(policy => {
        if (policy.status === 'cancelled') {
          stats.cancelled++;
        } else if (policy.status === 'active' && policy.endDate.seconds > now.seconds) {
          stats.active++;
        } else {
          stats.expired++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching policy statistics:', error);
      throw new Error('Failed to fetch policy statistics');
    }
  }

  // Update policy status
  static async updatePolicyStatus(policyId: string, status: Policy['status']): Promise<void> {
    try {
      const docRef = doc(db, POLICIES_COLLECTION, policyId);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating policy status:', error);
      throw new Error('Failed to update policy status');
    }
  }

  // Get single policy
  static async getPolicy(policyId: string): Promise<Policy | null> {
    try {
      const docRef = doc(db, POLICIES_COLLECTION, policyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Policy;
      }
      return null;
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw new Error('Failed to fetch policy');
    }
  }
}
