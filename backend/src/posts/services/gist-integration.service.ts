import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface GistFile {
  filename: string;
  language: string;
  content: string;
  raw_url: string;
}

export interface GistData {
  id: string;
  files: Record<string, GistFile>;
  description: string;
  html_url: string;
}

@Injectable()
export class GistIntegrationService {
  constructor(private readonly httpService: HttpService) {}

  /**
   * Extract Gist ID from URL
   */
  extractGistId(gistUrl: string): string {
    const match = gistUrl.match(/gist\.github\.com\/[\w-]+\/([\w]+)/);
    if (!match) {
      throw new BadRequestException('Invalid Gist URL');
    }
    return match[1];
  }

  /**
   * Fetch Gist data from GitHub API
   */
  async fetchGist(gistId: string): Promise<GistData> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.github.com/gists/${gistId}`),
      );
      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch Gist');
    }
  }

  /**
   * Parse Gist files into code snippets
   */
  parseGistFiles(gistData: GistData): Array<{
    language: string;
    code_body: string;
    filename: string;
  }> {
    const snippets = [];

    for (const [filename, file] of Object.entries(gistData.files)) {
      // Detect language from file extension or Gist metadata
      const language =
        file.language ||
        this.detectLanguageFromFilename(filename) ||
        'text';

      snippets.push({
        language,
        code_body: file.content,
        filename,
      });
    }

    return snippets;
  }

  /**
   * Detect programming language from filename
   */
  private detectLanguageFromFilename(filename: string): string | null {
    const extension = filename.split('.').pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      jsx: 'javascript',
      tsx: 'typescript',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      php: 'php',
      rb: 'ruby',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      sql: 'sql',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yml: 'yaml',
      yaml: 'yaml',
      md: 'markdown',
    };

    return languageMap[extension || ''] || null;
  }
}

