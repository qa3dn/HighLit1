import { Injectable } from '@nestjs/common';
import { GistIntegrationService } from './gist-integration.service';
import { CodeSnippet } from '../entities/code-snippet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CodeParserService {
  constructor(
    private readonly gistIntegrationService: GistIntegrationService,
    @InjectRepository(CodeSnippet)
    private codeSnippetsRepository: Repository<CodeSnippet>,
  ) {}

  /**
   * Parse code from Gist URL and create snippets
   */
  async parseGistToSnippets(
    gistUrl: string,
    postId: string,
  ): Promise<CodeSnippet[]> {
    const gistId = this.gistIntegrationService.extractGistId(gistUrl);
    const gistData = await this.gistIntegrationService.fetchGist(gistId);
    const parsedFiles = this.gistIntegrationService.parseGistFiles(gistData);

    const snippets = parsedFiles.map((file) =>
      this.codeSnippetsRepository.create({
        post_id: postId,
        language: file.language,
        code_body: file.code_body,
        gist_url: gistUrl,
      }),
    );

    return this.codeSnippetsRepository.save(snippets);
  }
}

