import { Sentiment } from '@prisma/client';

export class AIService {
  private positiveKeywords = [
    'love', 'great', 'awesome', 'amazing', 'good', 'excellent', 'fantastic',
    'best', 'superb', 'wonderful', 'helpful', 'perfect', 'easy', 'recommend',
    'saved', 'efficient', 'fast', 'friendly', 'happy', 'cool', 'impressive',
    'highly', 'beautiful', 'clean', 'simple', 'intuitive', 'glad', 'satisfy',
    'wowed', 'outstanding'
  ];

  private negativeKeywords = [
    'bad', 'terrible', 'worst', 'slow', 'broken', 'disappointed', 'hate',
    'useless', 'difficult', 'expensive', 'error', 'bug', 'fail', 'poor',
    'annoying', 'complaint', 'hard', 'waste', 'frustrated', 'ugly', 'clunky',
    'regret', 'issue'
  ];

  analyzeSentiment(text: string): Sentiment {
    if (!text || text.trim() === '') {
      return Sentiment.NEUTRAL;
    }

    const lowercase = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    this.positiveKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercase.match(regex);
      if (matches) {
        positiveCount += matches.length;
      }
    });

    this.negativeKeywords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowercase.match(regex);
      if (matches) {
        negativeCount += matches.length;
      }
    });

    if (positiveCount > negativeCount) {
      return Sentiment.POSITIVE;
    } else if (negativeCount > positiveCount) {
      return Sentiment.NEGATIVE;
    } else {
      return Sentiment.NEUTRAL;
    }
  }

  generateSocialCardConfig(testimonial: {
    reviewerName: string;
    reviewerTitle: string | null;
    textContent: string | null;
    rating: number;
  }) {
    const text = testimonial.textContent || '';
    const length = text.length;

    // Select premium gradients based on rating and length
    let bgGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    if (testimonial.rating >= 4) {
      bgGradient = 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'; // Dark slate
    } else if (testimonial.rating <= 2) {
      bgGradient = 'linear-gradient(135deg, #e65c00 0%, #f9d423 100%)'; // Warm amber
    }

    return {
      backgroundImage: bgGradient,
      textColor: '#ffffff',
      fontSize: length > 150 ? '14px' : '18px',
      fontFamily: 'Outfit, Inter, sans-serif',
      layout: length > 200 ? 'classic-quote' : 'compact-social',
      badgeEnabled: testimonial.rating >= 4
    };
  }
}
