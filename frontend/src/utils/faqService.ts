/**
 * FAQ Service
 * Manages frequently asked questions and help articles
 */

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful?: number;
  notHelpful?: number;
  relatedArticles?: string[]; // IDs of related FAQ items
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

class FAQService {
  private static instance: FAQService;

  private constructor() {}

  static getInstance(): FAQService {
    if (!FAQService.instance) {
      FAQService.instance = new FAQService();
    }
    return FAQService.instance;
  }

  /**
   * FAQ Categories
   */
  private categories: FAQCategory[] = [
    {
      id: 'getting_started',
      name: 'Getting Started',
      icon: '🚀',
      description: 'New to the platform? Start here',
    },
    {
      id: 'jobs',
      name: 'Jobs & Applications',
      icon: '💼',
      description: 'Finding and applying for jobs',
    },
    {
      id: 'profile',
      name: 'Profile & Settings',
      icon: '👤',
      description: 'Managing your account and profile',
    },
    {
      id: 'messaging',
      name: 'Messaging',
      icon: '💬',
      description: 'Communication and notifications',
    },
    {
      id: 'verification',
      name: 'Verification & Trust',
      icon: '✓',
      description: 'Building trust and credibility',
    },
    {
      id: 'interviews',
      name: 'Interviews',
      icon: '📅',
      description: 'Scheduling and attending interviews',
    },
    {
      id: 'billing',
      name: 'Billing & Plans',
      icon: '💳',
      description: 'Subscriptions and payments',
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: '🔧',
      description: 'Common issues and solutions',
    },
  ];

  /**
   * FAQ Items
   */
  private faqs: FAQItem[] = [
    // Getting Started
    {
      id: 'what_is_platform',
      question: 'What is this platform?',
      answer: 'This is a modern recruitment platform that connects talented candidates with leading companies. We use AI-powered matching, verified profiles, and streamlined communication to make hiring faster and more effective.',
      category: 'getting_started',
      tags: ['introduction', 'overview'],
      helpful: 42,
      notHelpful: 3,
    },
    {
      id: 'how_to_start_candidate',
      question: 'How do I get started as a candidate?',
      answer: '1. Create your account\n2. Complete your profile with skills and experience\n3. Verify your email and phone\n4. Browse and apply for jobs\n5. Connect with recruiters through messages',
      category: 'getting_started',
      tags: ['candidate', 'onboarding', 'setup'],
      helpful: 38,
      notHelpful: 2,
      relatedArticles: ['complete_profile', 'verify_email'],
    },
    {
      id: 'how_to_start_recruiter',
      question: 'How do I get started as a recruiter?',
      answer: '1. Create your company account\n2. Complete your company profile\n3. Post your first job\n4. Search for candidates\n5. Send messages and schedule interviews',
      category: 'getting_started',
      tags: ['recruiter', 'onboarding', 'setup'],
      helpful: 35,
      notHelpful: 1,
      relatedArticles: ['post_job', 'search_candidates'],
    },

    // Jobs & Applications
    {
      id: 'how_to_apply',
      question: 'How do I apply for a job?',
      answer: 'Click on any job listing, review the details, and click "Apply Now". You can attach your resume, write a cover letter, and answer any screening questions. Track your application status in the Applications page.',
      category: 'jobs',
      tags: ['apply', 'application', 'resume'],
      helpful: 52,
      notHelpful: 4,
    },
    {
      id: 'track_applications',
      question: 'How can I track my applications?',
      answer: 'Visit the Applications page to see all your submitted applications. You\'ll see the status (pending, reviewed, interviewing, offered, or rejected) and receive notifications for any updates.',
      category: 'jobs',
      tags: ['tracking', 'status', 'notifications'],
      helpful: 45,
      notHelpful: 2,
    },

    // Profile & Settings
    {
      id: 'complete_profile',
      question: 'How do I complete my profile?',
      answer: 'Go to your Profile page and fill in:\n• Personal information\n• Work experience\n• Education\n• Skills\n• Portfolio/Projects\n• Preferences (location, salary, remote work)\n\nA complete profile gets 3x more visibility!',
      category: 'profile',
      tags: ['profile', 'optimization', 'visibility'],
      helpful: 61,
      notHelpful: 3,
    },
    {
      id: 'change_password',
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security > Change Password. Enter your current password and your new password twice. Click Save. You\'ll receive an email confirmation.',
      category: 'profile',
      tags: ['security', 'password', 'account'],
      helpful: 28,
      notHelpful: 1,
    },

    // Verification
    {
      id: 'verify_email',
      question: 'How do I verify my email?',
      answer: 'Go to Profile > Verification and click "Verify Email". We\'ll send a 6-digit code to your email. Enter the code to complete verification. Email verification adds 20 points to your trust score.',
      category: 'verification',
      tags: ['verification', 'email', 'trust'],
      helpful: 47,
      notHelpful: 2,
      relatedArticles: ['trust_score', 'verify_phone'],
    },
    {
      id: 'verify_phone',
      question: 'How do I verify my phone number?',
      answer: 'Go to Profile > Verification and click "Verify Phone". We\'ll send a 6-digit code via SMS. Enter the code to complete verification. Phone verification adds 20 points to your trust score.',
      category: 'verification',
      tags: ['verification', 'phone', 'sms', 'trust'],
      helpful: 43,
      notHelpful: 3,
      relatedArticles: ['trust_score', 'verify_email'],
    },
    {
      id: 'trust_score',
      question: 'What is the trust score?',
      answer: 'Your trust score (0-100) measures your credibility:\n• Email verification: +20\n• Phone verification: +20\n• LinkedIn connection: +15\n• GitHub connection: +15\n• Identity verification: +30\n\nHigher scores increase your profile visibility.',
      category: 'verification',
      tags: ['trust', 'score', 'credibility'],
      helpful: 56,
      notHelpful: 4,
      relatedArticles: ['verify_email', 'verify_phone'],
    },

    // Messaging
    {
      id: 'message_templates',
      question: 'How do I use message templates?',
      answer: 'Click the Templates button when composing a message. Choose from pre-built templates for common scenarios or create your own custom templates. Templates save time and ensure professional communication.',
      category: 'messaging',
      tags: ['templates', 'messages', 'communication'],
      helpful: 39,
      notHelpful: 2,
    },
    {
      id: 'share_code',
      question: 'Can I share code snippets in messages?',
      answer: 'Yes! Click the Code button when composing a message. Paste your code, select the language (17+ supported), and add an optional title. The code will be syntax-highlighted and recipients can copy it with one click.',
      category: 'messaging',
      tags: ['code', 'snippets', 'technical'],
      helpful: 51,
      notHelpful: 1,
    },

    // Interviews
    {
      id: 'schedule_interview',
      question: 'How do I schedule an interview?',
      answer: 'Recruiters can schedule interviews from the application or message thread. Candidates will receive a notification with date, time, and meeting details. You can add the interview to your calendar and set reminders.',
      category: 'interviews',
      tags: ['scheduling', 'calendar', 'meetings'],
      helpful: 48,
      notHelpful: 3,
    },
    {
      id: 'reschedule_interview',
      question: 'Can I reschedule an interview?',
      answer: 'Yes! Go to your interview details and click "Request Reschedule". Choose from suggested times or pick a custom date/time. The other party will be notified and can accept or suggest alternatives.',
      category: 'interviews',
      tags: ['rescheduling', 'calendar', 'flexibility'],
      helpful: 44,
      notHelpful: 2,
    },

    // Troubleshooting
    {
      id: 'not_receiving_emails',
      question: 'I\'m not receiving emails. What should I do?',
      answer: '1. Check your spam/junk folder\n2. Add noreply@platform.com to your contacts\n3. Verify your email address is correct in Settings\n4. Check email notification preferences\n5. Contact support if issue persists',
      category: 'troubleshooting',
      tags: ['email', 'notifications', 'issues'],
      helpful: 33,
      notHelpful: 5,
    },
    {
      id: 'forgot_password',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot Password". Enter your email address and we\'ll send you a password reset link. Click the link and create a new password. The link expires in 1 hour for security.',
      category: 'troubleshooting',
      tags: ['password', 'reset', 'security'],
      helpful: 37,
      notHelpful: 2,
    },
  ];

  /**
   * Get all categories
   */
  getCategories(): FAQCategory[] {
    return this.categories;
  }

  /**
   * Get FAQs by category
   */
  getFAQsByCategory(categoryId: string): FAQItem[] {
    return this.faqs.filter(faq => faq.category === categoryId);
  }

  /**
   * Search FAQs
   */
  searchFAQs(query: string): FAQItem[] {
    if (!query.trim()) {
      return this.faqs;
    }

    const lowerQuery = query.toLowerCase();

    return this.faqs.filter(faq => {
      return (
        faq.question.toLowerCase().includes(lowerQuery) ||
        faq.answer.toLowerCase().includes(lowerQuery) ||
        faq.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get FAQ by ID
   */
  getFAQById(id: string): FAQItem | null {
    return this.faqs.find(faq => faq.id === id) || null;
  }

  /**
   * Get related FAQs
   */
  getRelatedFAQs(faqId: string): FAQItem[] {
    const faq = this.getFAQById(faqId);
    if (!faq || !faq.relatedArticles) {
      return [];
    }

    return faq.relatedArticles
      .map(id => this.getFAQById(id))
      .filter((item): item is FAQItem => item !== null);
  }

  /**
   * Mark FAQ as helpful
   */
  async markHelpful(faqId: string, helpful: boolean): Promise<void> {
    try {
      await fetch(`/api/faq/${faqId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ helpful }),
      });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  }

  /**
   * Get popular FAQs
   */
  getPopularFAQs(limit: number = 5): FAQItem[] {
    return [...this.faqs]
      .sort((a, b) => {
        const aScore = (a.helpful || 0) - (a.notHelpful || 0);
        const bScore = (b.helpful || 0) - (b.notHelpful || 0);
        return bScore - aScore;
      })
      .slice(0, limit);
  }
}

export const faqService = FAQService.getInstance();
