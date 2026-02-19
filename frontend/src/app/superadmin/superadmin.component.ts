import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { CommunityService } from '../services/community.service';
import { UserService } from '../services/user.service';
import { finalize } from 'rxjs/operators';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-superadmin',
  standalone: true,
  imports: [CommonModule, FooterComponent, RouterLink],
  templateUrl: './superadmin.component.html',
  styleUrl: './superadmin.component.css',
})
export class SuperadminComponent implements OnInit {
  currentUser: any = null;
  communities: any[] = [];
  topPerformingCommunities: Array<{
    _id: string;
    name: string;
    memberCount: number;
  }> = [];

  isLoading = true;
  isDeleting = false;
  errorMessage = '';

  totalCommunities = 0;
  totalUsers = 0;
  activeEngagement = 0;

  constructor(
    private communityService: CommunityService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.bootstrap();
  }

  private bootstrap() {
    this.currentUser = this.userService.getCurrentUser();

    if (!this.currentUser) {
      this.userService.validateSession().subscribe({
        next: (res: any) => {
          this.currentUser = res?.user || this.userService.getCurrentUser();
          this.ensureAdmin();
          this.loadDashboard();
        },
        error: () => {
          this.router.navigate(['/home']);
        },
      });
      return;
    }

    this.ensureAdmin();
    this.loadDashboard();
  }

  private ensureAdmin() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/home']);
    }
  }

  private loadDashboard() {
    this.isLoading = true;
    this.loadUsers();
    this.loadCommunities();
  }

  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        const users = res?.data || res || [];
        this.totalUsers = users.length;
        const activeUsers = users.filter(
          (u: any) => (u?.joinedCommunities || []).length > 0,
        ).length;
        this.activeEngagement =
          this.totalUsers > 0 ? Math.round((activeUsers / this.totalUsers) * 100) : 0;
      },
      error: () => {
        this.errorMessage = 'Failed to load users';
      },
    });
  }

  private loadCommunities() {
    this.communityService
      .getAllCommunities()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res: any) => {
          const communities = res?.data || res || [];
          this.communities = communities;
          this.totalCommunities = communities.length;
          this.topPerformingCommunities = this.buildTopPerformingCommunities(communities);
        },
        error: () => {
          this.errorMessage = 'Failed to load communities';
        },
      });
  }

  private buildTopPerformingCommunities(communities: any[]) {
    return [...(communities || [])]
      .map((community: any) => ({
        _id: community?._id,
        name: community?.name || 'Unnamed Community',
        memberCount: (community?.members || []).length,
      }))
      .sort((a, b) => {
        if (b.memberCount !== a.memberCount) return b.memberCount - a.memberCount;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 3);
  }

  getMemberCount(community: any): number {
    return (community?.members || []).length;
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value || 0);
  }

  viewCommunity(communityId: string) {
    if (!communityId) return;
    this.router.navigate(['/community', communityId]);
  }

  RemoveCommunity(community: any) {
    if (!community?._id) return;
    const ok = confirm(`Remove community "${community.name || 'this community'}"?`);
    if (!ok) return;

    this.isDeleting = true;
    this.communityService
      .deleteCommunity(community._id)
      .pipe(finalize(() => (this.isDeleting = false)))
      .subscribe({
        next: (res: any) => {
          this.communities = this.communities.filter((c) => c._id !== community._id);
          this.totalCommunities = this.communities.length;
          this.topPerformingCommunities = this.buildTopPerformingCommunities(this.communities);
          alert(res?.message || 'Community deactivated successfully');
        },
        error: (err: any) => {
          alert(err?.error?.error || 'Failed to deactivate community');
        },
      });
  }

  downloadReport() {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Communities Analytics Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`Total Communities: ${this.totalCommunities}`, 14, 35);
    doc.text(`Total Users: ${this.totalUsers}`, 14, 45);
    doc.text(`Active Engagement: ${this.activeEngagement}%`, 14, 55);

    // Top Performing Communities Table
    const tableData = this.topPerformingCommunities.map((c, index) => [
      index + 1,
      c.name,
      c.memberCount,
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Community Name', 'Members']],
      body: tableData,
    });

    doc.save('communities-report.pdf');
  }
}
