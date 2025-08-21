import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  text: string;
  suggestions?: string[];
}

export class AIAssistantService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: any = null;
  
  static {
    // Initialize the Google Generative AI client
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      } catch (error) {
        console.warn('Failed to initialize Google Generative AI:', error);
      }
    }
  }

  // System context for the insurance assistant
  private static readonly SYSTEM_CONTEXT = `You are a helpful AI assistant for SecureMotor Insurance platform. 
  You help users with:
  - Navigating the insurance platform
  - Understanding insurance policies and coverage types (Comprehensive, Third Party, Fire & Theft)
  - Getting quotes and purchasing policies
  - Filing and tracking claims
  - Understanding premiums and pricing
  - General insurance questions
  
  Platform features include:
  - Dashboard: View all policies, claims, and quotes
  - Get Quote: Create new insurance quotes
  - Policies: Manage active policies
  - Claims: File and track insurance claims
  - Premium rates: Base K500, Coverage fees vary by type
  
  Always be helpful, concise, and professional. If asked about specific policy details or claims, remind users to check their dashboard or contact support for personalized information.`;

  static async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<AIResponse> {
    // Use mock responses if no model is available
    if (!this.model) {
      return this.getMockResponse(message);
    }

    try {
      // Build conversation context
      const conversationContext = conversationHistory
        .slice(-5) // Keep last 5 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${this.SYSTEM_CONTEXT}

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}
User: ${message}

Assistant: `;

      // Generate content using the SDK
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text() || this.getMockResponse(message).text;

      // Generate suggestions based on context
      const suggestions = this.generateSuggestions(message);

      return {
        text: text.trim(),
        suggestions
      };
    } catch (error: any) {
      console.warn('AI generation failed, using mock response:', error.message);
      // Return mock response on error
      return this.getMockResponse(message);
    }
  }

  private static generateSuggestions(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('quote') || lowerMessage.includes('price')) {
      return ['Get a Quote', 'View Coverage Types', 'Calculate Premium'];
    }
    
    if (lowerMessage.includes('claim')) {
      return ['File a Claim', 'Track Claim Status', 'Claim Requirements'];
    }
    
    if (lowerMessage.includes('policy') || lowerMessage.includes('coverage')) {
      return ['View My Policies', 'Coverage Types', 'Renew Policy'];
    }
    
    if (lowerMessage.includes('pay') || lowerMessage.includes('premium')) {
      return ['Make Payment', 'View Billing', 'Payment Methods'];
    }
    
    return ['Get a Quote', 'View Policies', 'File a Claim', 'Contact Support'];
  }

  // Predefined quick responses for common questions
  static getQuickResponses(): { question: string; answer: string }[] {
    return [
      {
        question: "What types of coverage do you offer?",
        answer: "We offer three main types of coverage: Comprehensive (K3000) - full coverage including theft and damage, Third Party (K1000) - covers damage to others, and Fire & Theft (K2000) - covers fire damage and theft of your vehicle."
      },
      {
        question: "How do I get a quote?",
        answer: "Getting a quote is easy! Click on 'Get Quote' in the navigation menu, fill in your vehicle details and personal information, select your preferred coverage type, and you'll receive an instant quote with premium calculation."
      },
      {
        question: "How do I file a claim?",
        answer: "To file a claim: 1) Go to the Claims section, 2) Click 'New Claim', 3) Select your policy, 4) Provide incident details and upload photos, 5) Submit for review. You'll receive a claim number for tracking."
      },
      {
        question: "What factors affect my premium?",
        answer: "Your premium is calculated based on: Base premium (K500), Coverage type fee, Vehicle age (additional K100 for vehicles over 10 years), Number of additional drivers (K200 each), plus 3% tax on the total."
      },
      {
        question: "How long does claim processing take?",
        answer: "Claims are typically reviewed within 2-3 business days. Once approved, settlements are processed within 5-7 business days. You can track your claim status in real-time through your dashboard."
      }
    ];
  }

  // Context-aware responses based on current page
  static getPageContext(pathname: string): string {
    const contexts: { [key: string]: string } = {
      '/dashboard': 'You\'re on the Dashboard where you can view all your policies, recent quotes, and claims.',
      '/new-quote': 'You\'re on the Quote page. Fill in your details to get an instant insurance quote.',
      '/policies': 'This is your Policies page showing all your active and past insurance policies.',
      '/claims': 'You\'re viewing the Claims section where you can file new claims and track existing ones.',
      '/new-claim': 'You\'re filing a new claim. Make sure to provide detailed information and photos.',
      '/purchase': 'You\'re on the Purchase page. Review your quote details before proceeding with payment.'
    };

    return contexts[pathname] || 'You\'re on the SecureMotor Insurance platform. How can I help you today?';
  }

  // Mock response generator for development and fallback
  private static getMockResponse(message: string): AIResponse {
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return {
        text: "Hello! I'm your SecureMotor AI Assistant. I can help you with getting quotes, understanding policies, filing claims, and answering any insurance questions you might have. What would you like to know?",
        suggestions: ['Get a Quote', 'View Policies', 'File a Claim', 'Coverage Types']
      };
    }

    // Quote-related questions
    if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return {
        text: "Getting a quote is simple! Click on 'Get Quote' in the navigation menu. You'll need to provide:\n\n• Vehicle details (make, model, year)\n• Your personal information\n• Desired coverage type\n\nOur base premium starts at K500, with additional fees based on coverage type:\n• Third Party: K1,000\n• Fire & Theft: K2,000\n• Comprehensive: K3,000\n\nWould you like me to guide you to the quote page?",
        suggestions: ['Get a Quote', 'Coverage Types', 'Premium Calculator']
      };
    }

    // Claim-related questions
    if (lowerMessage.includes('claim') || lowerMessage.includes('accident')) {
      return {
        text: "For filing a claim, you have two options:\n\n1. **Online**: Go to Claims → New Claim\n2. **Phone**: Call our 24/7 hotline\n\nYou'll need:\n• Policy number\n• Incident date and location\n• Description of damage\n• Photos (if available)\n• Police report (for accidents)\n\nClaims are typically processed within 2-3 business days.",
        suggestions: ['File a Claim', 'Track Claim', 'Claim Requirements']
      };
    }

    // Coverage types
    if (lowerMessage.includes('coverage') || lowerMessage.includes('comprehensive') || lowerMessage.includes('third party')) {
      return {
        text: "We offer three coverage types:\n\n**Third Party (K1,000)**\n• Covers damage to other vehicles\n• Legal liability protection\n• Most affordable option\n\n**Fire & Theft (K2,000)**\n• Third party coverage plus\n• Protection against fire damage\n• Coverage for vehicle theft\n\n**Comprehensive (K3,000)**\n• Complete coverage\n• Your vehicle damage\n• Third party liability\n• Fire, theft, and natural disasters\n\nWhich type interests you?",
        suggestions: ['Get a Quote', 'Compare Coverage', 'View Policies']
      };
    }

    // Policy questions
    if (lowerMessage.includes('policy') || lowerMessage.includes('renew')) {
      return {
        text: "For policy management:\n\n• **View Policies**: Check your active and past policies in the Policies section\n• **Renew**: Policies can be renewed 30 days before expiry\n• **Update**: You can update vehicle or personal details anytime\n• **Documents**: Download policy documents from your dashboard\n\nNeed help with a specific policy task?",
        suggestions: ['View My Policies', 'Renew Policy', 'Update Details']
      };
    }

    // Payment questions
    if (lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
      return {
        text: "We accept multiple payment methods:\n\n• **Credit/Debit Cards**: Visa, Mastercard\n• **Mobile Money**: MTN, Airtel, Zamtel\n• **Bank Transfer**: Direct deposit\n• **Cash**: At our office locations\n\nPayments are processed instantly for cards and mobile money. Bank transfers may take 1-2 business days.",
        suggestions: ['Make Payment', 'Payment History', 'Payment Methods']
      };
    }

    // Help or support
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
      return {
        text: "I'm here to help! You can:\n\n• Ask me any insurance-related questions\n• Call our support: 0211-XXX-XXX\n• Email: support@securemotor.com\n• Visit our office: Monday-Friday, 8am-5pm\n\nFor emergencies, use our 24/7 hotline: 0966-XXX-XXX\n\nWhat specific help do you need?",
        suggestions: ['FAQ', 'Contact Support', 'Office Locations']
      };
    }

    // Default response
    return {
      text: "I can help you with:\n\n• Getting insurance quotes\n• Understanding coverage types\n• Filing and tracking claims\n• Managing your policies\n• Payment and billing questions\n\nWhat would you like to know more about?",
      suggestions: this.generateSuggestions(message)
    };
  }
}
