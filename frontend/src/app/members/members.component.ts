import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { CommunityService } from '../services/community.service';
import { FooterComponent } from '../footer/footer.component';

interface Member {
  _id: string;
  name: string;
  profileImage?: string;
  email?: string;
}

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
})
export class MembersComponent implements OnInit {
  communityId!: string;
  members: Member[] = [];
  isLoading = false;
  currentUser: any;
  communityName = '';
  leaderId = '';
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.communityId = params.get('communityId') || '';
      if (!this.communityId) return;

      this.currentUser = this.userService.getCurrentUser();
      this.loadMembers();
    });
  }

  loadMembers() {
    this.isLoading = true;
    this.communityService.getCommunityById(this.communityId).subscribe({
      next: (res: any) => {
        const community = res.data || res;
        this.members = community.members || [];
        this.communityName = community.name || 'Community';
        this.leaderId = community.leader || '';
        this.isLoading = false;
      },
      error: () => {
        alert('Failed to load members');
        this.isLoading = false;
      },
    });
  }

  removeMember(memberId: string) {
    const ok = confirm('Are you sure you want to remove this member?');
    if (!ok) return;

    this.communityService.removeMember(this.communityId, memberId).subscribe({
      next: () => {
        this.members = this.members.filter((m) => m._id !== memberId);
        alert('Member removed successfully');
      },
      error: () => alert('Failed to remove member'),
    });
  }
}
