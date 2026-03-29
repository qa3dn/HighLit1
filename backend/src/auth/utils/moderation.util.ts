/**
 * Basic moderation utility for filtering inappropriate content
 * In production, this should be replaced with a more sophisticated solution
 */

const BAD_WORDS = [
  // Add Arabic and English bad words here
  // This is a basic implementation
];

const WARNING_WORDS = [
  // Words that trigger a warning but not rejection
  // Can be expanded with more sophisticated detection
];

export class ModerationUtil {
  /**
   * Check if content contains inappropriate words
   */
  static containsBadWords(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return BAD_WORDS.some((word) => lowerContent.includes(word.toLowerCase()));
  }

  /**
   * Check if content contains words that should trigger a warning
   */
  static containsWarningWords(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return WARNING_WORDS.some((word) => lowerContent.includes(word.toLowerCase()));
  }

  /**
   * Moderate content and return cleaned version with warnings
   */
  static moderateContent(content: string): {
    isClean: boolean;
    cleanedContent?: string;
    hasWarning?: boolean;
    warningMessage?: string;
  } {
    if (this.containsBadWords(content)) {
      return {
        isClean: false,
      };
    }

    const hasWarning = this.containsWarningWords(content);
    const warningMessage = hasWarning
      ? 'بتحب تعيد صياغتها؟ خلّينا نخليها أخف.'
      : undefined;

    return {
      isClean: true,
      cleanedContent: content,
      hasWarning,
      warningMessage,
    };
  }

  /**
   * Suggest a rewritten version of content (simplified)
   */
  static suggestRewrite(content: string): string {
    // Basic implementation - can be enhanced with AI/ML
    // For now, just return a message
    return content.replace(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
  }
}

