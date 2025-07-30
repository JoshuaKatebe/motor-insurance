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

export interface Claim {
  id?: string;
  policyId: string;
  userId: string;
  claimNumber: string;
  incidentDate: Timestamp;
  incidentType: 'accident' | 'theft' | 'fire' | 'vandalism' | 'natural-disaster' | 'other';
  incidentDescription: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'settled';
  estimatedAmount: number;
  approvedAmount?: number;
  imageUrls?: string[]; // URLs of uploaded accident images
  submittedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const CLAIMS_COLLECTION = 'claims';

export class ClaimsService {
  // Generate claim number
  private static generateClaimNumber(): string {
    const prefix = 'CL';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  // Create a new claim
  static async createClaim(claimData: Omit<Claim, 'id' | 'claimNumber' | 'createdAt' | 'updatedAt' | 'submittedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      
      const claim: Omit<Claim, 'id'> = {
        ...claimData,
        claimNumber: this.generateClaimNumber(),
        status: 'submitted',
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, CLAIMS_COLLECTION), claim);
      return docRef.id;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw new Error('Failed to create claim');
    }
  }

  // Get all claims for a user
  static async getUserClaims(userId: string): Promise<Claim[]> {
    try {
      const q = query(
        collection(db, CLAIMS_COLLECTION),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const claims = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Claim));
      
      // Sort by createdAt descending (newest first)
      return claims.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    } catch (error) {
      console.error('Error fetching user claims:', error);
      throw new Error('Failed to fetch claims');
    }
  }

  // Get recent claims for dashboard
  static async getRecentClaims(userId: string, limitCount: number = 5): Promise<Claim[]> {
    try {
      const claims = await this.getUserClaims(userId);
      return claims.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recent claims:', error);
      throw new Error('Failed to fetch recent claims');
    }
  }

  // Get single claim
  static async getClaim(claimId: string): Promise<Claim | null> {
    try {
      const docRef = doc(db, CLAIMS_COLLECTION, claimId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Claim;
      }
      return null;
    } catch (error) {
      console.error('Error fetching claim:', error);
      throw new Error('Failed to fetch claim');
    }
  }

  // Update claim status
  static async updateClaimStatus(claimId: string, status: Claim['status'], approvedAmount?: number): Promise<void> {
    try {
      const docRef = doc(db, CLAIMS_COLLECTION, claimId);
      const updateData: { status: Claim['status']; updatedAt: Timestamp; approvedAmount?: number } = {
        status,
        updatedAt: Timestamp.now()
      };

      if (approvedAmount !== undefined) {
        updateData.approvedAmount = approvedAmount;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw new Error('Failed to update claim status');
    }
  }

  // Get claim statistics
  static async getClaimStats(userId: string): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    settled: number;
  }> {
    try {
      const claims = await this.getUserClaims(userId);

      const stats = {
        total: claims.length,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        settled: 0
      };

      claims.forEach(claim => {
        switch (claim.status) {
          case 'submitted':
            stats.pending++;
            break;
          case 'under-review':
            stats.underReview++;
            break;
          case 'approved':
            stats.approved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
          case 'settled':
            stats.settled++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching claim statistics:', error);
      throw new Error('Failed to fetch claim statistics');
    }
  }

  // Get pending claims count
  static async getPendingClaimsCount(userId: string): Promise<number> {
    try {
      const claims = await this.getUserClaims(userId);
      return claims.filter(claim => 
        claim.status === 'submitted' || 
        claim.status === 'under-review' || 
        claim.status === 'approved'
      ).length;
    } catch (error) {
      console.error('Error fetching pending claims count:', error);
      return 0;
    }
  }

  // Delete claim (only for drafts)
  static async deleteClaim(claimId: string): Promise<void> {
    try {
      const claim = await this.getClaim(claimId);
      if (!claim) {
        throw new Error('Claim not found');
      }

      if (claim.status !== 'draft') {
        throw new Error('Can only delete draft claims');
      }

      const docRef = doc(db, CLAIMS_COLLECTION, claimId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting claim:', error);
      throw new Error('Failed to delete claim');
    }
  }
}
