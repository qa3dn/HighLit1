import * as crypto from 'crypto';

export class AnonymousHashUtil {
  /**
   * Generate a unique anonymous hash for a user
   * This hash is used to track anonymous posts without revealing identity
   */
  static generateHash(userId: string, timestamp: number): string {
    const data = `${userId}-${timestamp}-${process.env.JWT_SECRET || 'secret'}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  /**
   * Generate anonymous hash for a post
   * This ensures we can track abuse without revealing user identity
   */
  static generatePostHash(userId: string, postId: string): string {
    const data = `${userId}-${postId}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }
}

