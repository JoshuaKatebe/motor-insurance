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
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Quote {
  id?: string;
  userId: string;
  // Vehicle Information
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  engineSize: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  vehicleValue: number;
  color: string;
  chassisNumber: string;
  // Coverage Details
  coverageType: 'third-party' | 'comprehensive' | 'fire-theft';
  startDate: string;
  duration: number;
  additionalDrivers: number;
  voluntaryExcess: number;
  // Quote Details
  premium: number;
  status: 'draft' | 'active' | 'expired' | 'converted';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt: Timestamp;
}

const QUOTES_COLLECTION = 'quotes';

export class QuotesService {
  // Create a new quote
  static async createQuote(quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const expiresAt = new Timestamp(now.seconds + (30 * 24 * 60 * 60), 0); // 30 days from now
      
      const quote = {
        ...quoteData,
        createdAt: now,
        updatedAt: now,
        expiresAt,
        status: 'active' as const
      };

      const docRef = await addDoc(collection(db, QUOTES_COLLECTION), quote);
      return docRef.id;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw new Error('Failed to create quote');
    }
  }

  // Get all quotes for a user
  static async getUserQuotes(userId: string): Promise<Quote[]> {
    try {
      const q = query(
        collection(db, QUOTES_COLLECTION),
        where('userId', '==', userId)
        // orderBy('createdAt', 'desc') // Temporarily commented out - requires composite index
      );

      const querySnapshot = await getDocs(q);
      const quotes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Quote));
      
      // Sort by createdAt descending (newest first) since we can't use orderBy without index
      return quotes.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    } catch (error) {
      console.error('Error fetching user quotes:', error);
      throw new Error('Failed to fetch quotes');
    }
  }

  // Get recent quotes for dashboard (limited)
  static async getRecentQuotes(userId: string, limitCount: number = 5): Promise<Quote[]> {
    try {
      const quotes = await this.getUserQuotes(userId);
      return quotes.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recent quotes:', error);
      throw new Error('Failed to fetch recent quotes');
    }
  }

  // Get a single quote by ID
  static async getQuote(quoteId: string): Promise<Quote | null> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, quoteId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Quote;
      }
      return null;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw new Error('Failed to fetch quote');
    }
  }

  // Update a quote
  static async updateQuote(quoteId: string, updates: Partial<Quote>): Promise<void> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, quoteId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      throw new Error('Failed to update quote');
    }
  }

  // Delete a quote
  static async deleteQuote(quoteId: string): Promise<void> {
    try {
      const docRef = doc(db, QUOTES_COLLECTION, quoteId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw new Error('Failed to delete quote');
    }
  }

  // Convert quote to policy (update status)
  static async convertQuoteToPolicy(quoteId: string): Promise<void> {
    try {
      await this.updateQuote(quoteId, { status: 'converted' });
    } catch (error) {
      console.error('Error converting quote to policy:', error);
      throw new Error('Failed to convert quote to policy');
    }
  }

  // Get quote statistics for a user
  static async getQuoteStats(userId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    converted: number;
  }> {
    try {
      const quotes = await this.getUserQuotes(userId);
      const now = Timestamp.now();

      const stats = {
        total: quotes.length,
        active: 0,
        expired: 0,
        converted: 0
      };

      quotes.forEach(quote => {
        if (quote.status === 'converted') {
          stats.converted++;
        } else if (quote.expiresAt.seconds < now.seconds) {
          stats.expired++;
        } else {
          stats.active++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching quote statistics:', error);
      throw new Error('Failed to fetch quote statistics');
    }
  }
}
