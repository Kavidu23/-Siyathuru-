import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { FormsModule } from '@angular/forms';
import { AiService } from '../services/ai.service';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../services/community.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-askai',
  standalone: true,
  imports: [FooterComponent, FormsModule, CommonModule, RouterModule],
  templateUrl: './askai.component.html',
  styleUrl: './askai.component.css',
})
export class AskaiComponent implements OnInit {
  userMessage: string = '';
  sentUserMessage: string = '';
  aiReply: string = '';
  communities: any[] = [];
  suggestedCommunities: any[] = [];
  isLoading: boolean = false;

  constructor(
    private aiService: AiService,
    private communityService: CommunityService,
  ) {}

  ngOnInit(): void {
    this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.communities = Array.isArray(list) ? list : [];
      },
      error: (err) => {
        console.error('Failed to load communities for AI cards:', err);
        this.communities = [];
      },
    });
  }

  sendMessage() {
    const messageToSend = this.userMessage.trim();
    if (!messageToSend) return;

    this.sentUserMessage = messageToSend;
    this.userMessage = '';
    this.aiReply = '';
    this.suggestedCommunities = [];
    this.isLoading = true;

    this.aiService.askAI(messageToSend).subscribe({
      next: (res) => {
        this.aiReply = res.reply;
        this.suggestedCommunities = this.findSuggestedCommunities(res.reply);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.aiReply = 'AI is currently unavailable.';
        this.suggestedCommunities = [];
        this.isLoading = false;
      },
    });
  }

  formatAiReply(reply: string): string {
    if (!reply) return '';

    return reply
      .replace(/^\s{0,3}#{1,6}\s+/gm, '') // markdown headings
      .replace(/\*\*(.*?)\*\*/g, '$1') // bold markdown
      .replace(/^\s*\*(.+?)\*\s*$/gm, '$1') // italic full lines
      .replace(/(^|\s)\*([^*\n]+)\*(?=\s|$)/g, '$1$2') // inline italics
      .replace(/^\s*[-*]\s+/gm, '- ') // markdown bullet lines
      .replace(/`/g, '') // inline code markers
      .trim();
  }

  private findSuggestedCommunities(reply: string): any[] {
    if (!reply || !this.communities.length) return [];

    const normalizedReply = this.normalizeText(this.formatAiReply(reply));

    return this.communities
      .filter((community) => {
        const name = this.normalizeText(community?.name || '');
        return !!name && normalizedReply.includes(name);
      })
      .slice(0, 4);
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  get hasConversation(): boolean {
    return !!this.sentUserMessage || !!this.aiReply || this.isLoading;
  }
}
