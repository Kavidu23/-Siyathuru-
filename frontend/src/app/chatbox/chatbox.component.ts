import { Component, OnInit, OnDestroy } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { ViewportScroller, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService, ChatMessage } from '../services/chat.service';
import { UserService } from '../services/user.service';
import { CommunityService } from '../services/community.service';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [FooterComponent, CommonModule, FormsModule],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.css',
})
export class ChatboxComponent implements OnInit, OnDestroy {
  constructor(
    private viewportScroller: ViewportScroller,
    private chatService: ChatService,
    private userService: UserService,
    private communityService: CommunityService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  communityId = '';
  currentUser: any;
  joinedCommunities: any[] = [];
  selectedCommunity: any = null;
  contacts: any[] = [];
  selectedContact: any = null;
  messages: ChatMessage[] = [];

  text = '';
  isLoading = false;
  isLoadingContacts = false;
  private subs: Subscription[] = [];
  private stopListening: (() => void) | null = null;

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);

    const authSub = this.userService.authState$.subscribe((user) => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/home']);
        return;
      }
      this.loadCommunities();
    });
    this.subs.push(authSub);

    const routeSub = this.route.queryParamMap.subscribe((params) => {
      const qid = params.get('communityId') || '';
      if (qid) {
        this.communityId = qid;
      }
    });
    this.subs.push(routeSub);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
    this.stopListening?.();
  }

  loadCommunities() {
    if (!this.currentUser) return;

    this.isLoading = true;
    const sub = this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const all: any[] = res?.data || res || [];
        const userId = this.currentUser._id;

        const userJoinedIds = (this.currentUser?.joinedCommunities || []).map((c: any) =>
          String(c),
        );

        this.joinedCommunities = all.filter((c) => {
          const isLeader = c?.leader?._id === userId || c?.leader === userId;
          const isMember = c?.members?.some(
            (m: any) => m?._id === userId || m === userId || String(m) === userId,
          );
          const inUserJoined = userJoinedIds.includes(String(c._id));
          return isLeader || isMember || inUserJoined;
        });

        const preferred =
          this.joinedCommunities.find((c) => c._id === this.communityId) ||
          this.joinedCommunities[0] ||
          null;

        if (preferred) {
          this.selectCommunity(preferred);
        }
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => (this.isLoading = false),
    });

    this.subs.push(sub);
  }

  selectCommunity(community: any) {
    if (!community?._id) return;

    if (this.communityId !== community._id) {
      this.communityId = community._id;
    }
    this.selectedCommunity = community;
    this.selectedContact = null;
    this.contacts = [];
    this.messages = [];

    this.loadCommunityDetails(community._id);
  }

  loadCommunityDetails(communityId: string) {
    if (!communityId || !this.currentUser) return;

    this.isLoadingContacts = true;

    const sub = this.communityService.getCommunityById(communityId).subscribe({
      next: (res: any) => {
        const community = res?.data || res;
        if (!community) return;

        const leaderId = community?.leader?._id || community?.leader || '';
        const isLeader = leaderId === this.currentUser._id;

        if (isLeader) {
          const members = community.members || [];
          this.contacts = members.filter((m: any) => m?._id && m._id !== leaderId);
          this.selectedContact = this.contacts[0] || null;
          if (this.selectedContact) {
            this.openThread(this.selectedContact);
          }
        } else {
          if (community?.leader?.name) {
            this.contacts = [community.leader];
            this.selectedContact = community.leader;
            this.openThread(this.selectedContact);
          } else if (leaderId) {
            const leaderSub = this.userService.getUserById(leaderId).subscribe({
              next: (uRes: any) => {
                const leader = uRes?.data || uRes;
                if (leader) {
                  this.contacts = [leader];
                  this.selectedContact = leader;
                  this.openThread(this.selectedContact);
                }
              },
            });
            this.subs.push(leaderSub);
          }
        }
      },
      error: () => {
        this.isLoadingContacts = false;
      },
      complete: () => (this.isLoadingContacts = false),
    });

    this.subs.push(sub);
  }

  selectContact(contact: any) {
    if (!contact?._id) return;
    this.selectedContact = contact;
    this.openThread(contact);
  }

  openThread(contact: any) {
    if (!this.currentUser?._id || !contact?._id || !this.communityId) return;

    const threadId = this.buildThreadId(this.currentUser._id, contact._id, this.communityId);

    this.stopListening?.();
    this.stopListening = this.chatService.listenMessages(
      this.communityId,
      threadId,
      (messages: ChatMessage[]) => {
        this.messages = messages || [];

        const last = this.messages[this.messages.length - 1];
        const lastTs =
          last?.timestamp?.toMillis?.() ||
          (last?.timestamp?.seconds ? last.timestamp.seconds * 1000 : undefined);

        this.chatService.markThreadSeen(threadId, lastTs);
      },
    );

    this.chatService.markThreadSeen(threadId);
  }

  buildThreadId(userA: string, userB: string, communityId: string): string {
    const [first, second] = [userA, userB].sort();
    return `${communityId}_${first}_${second}`;
  }

  send() {
    if (!this.text.trim()) return;
    const user = this.currentUser || this.userService.getCurrentUser();
    if (!user || !this.communityId || !this.selectedContact?._id) return;

    const threadId = this.buildThreadId(user._id, this.selectedContact._id, this.communityId);

    this.chatService.sendMessage(this.communityId, threadId, {
      senderId: user._id,
      senderName: user.name,
      recipientId: this.selectedContact._id,
      text: this.text.trim(),
    });

    this.text = '';
  }

  isOwnMessage(msg: ChatMessage): boolean {
    return !!this.currentUser && msg.senderId === this.currentUser._id;
  }
}
