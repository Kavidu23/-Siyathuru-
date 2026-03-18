import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { UserService } from '../services/user.service';
import { CommunityService } from '../services/community.service';
import { AlertService } from '../services/alert.service';
import { EventService } from '../services/event.service';
import { FeedbackService } from '../services/feedback.service';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css'],
})
export class ChartDashboardComponent implements OnInit, OnDestroy {
  userGrowthData: number[] = [];
  alertCount = 0;
  eventCounts = 0;
  feedbackCount = 0;
  communityCategoryData: { labels: string[]; counts: number[] } = { labels: [], counts: [] };
  Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  @ViewChild('userGrowthChart') userGrowthChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('activityChart') activityChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChart!: ElementRef<HTMLCanvasElement>;

  private userGrowthChartInstance?: Chart;
  private activityChartInstance?: Chart;
  private categoryChartInstance?: Chart;

  constructor(
    private viewportScroller: ViewportScroller,
    private userService: UserService,
    private communityService: CommunityService,
    private alertService: AlertService,
    private eventService: EventService,
    private feedbackService: FeedbackService,
  ) {}

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
    this.loadUserGrowthData();
    this.loadCommunityCategoryData();
    this.loadActivityData();
  }

  ngOnDestroy(): void {
    this.userGrowthChartInstance?.destroy();
    this.activityChartInstance?.destroy();
    this.categoryChartInstance?.destroy();
  }

  loadUserGrowthData() {
    this.userService.getUserCountByMonth().subscribe(
      (response) => {
        if (response.success && response.data) {
          const monthlyData = new Array(12).fill(0);

          response.data.forEach((item: any) => {
            const index = this.Months.indexOf(item.month);
            if (index !== -1) {
              monthlyData[index] = item.count;
            }
          });

          this.userGrowthData = monthlyData;
          this.renderUserGrowthChart();
        }
      },
      (error) => {
        console.error('Error fetching user growth data:', error);
      },
    );
  }

  loadCommunityCategoryData() {
    this.communityService.getAllCommunities().subscribe({
      next: (res: any) => {
        const communities = res.data;
        const categoryCount: Record<string, number> = {};

        communities.forEach((community: any) => {
          const type = community.type || 'Other';
          categoryCount[type] = (categoryCount[type] || 0) + 1;
        });

        this.communityCategoryData = {
          labels: Object.keys(categoryCount),
          counts: Object.values(categoryCount),
        };

        this.renderCategoryChart();
      },
      error: (err) => {
        console.error('Error fetching community category data:', err);
      },
    });
  }

  loadActivityData() {
    forkJoin({
      eventCount: this.eventService.getNumberOfEvents(),
      alertCount: this.alertService.getNumberOfAlerts(),
      feedbackCount: this.feedbackService.getNumberOfFeedbacks(),
    }).subscribe({
      next: ({ eventCount, alertCount, feedbackCount }) => {
        this.eventCounts = eventCount.count;
        this.alertCount = alertCount.count;
        this.feedbackCount = feedbackCount.count;
        this.renderActivityChart();
      },
      error: (err) => console.error('Error fetching activity data:', err),
    });
  }

  renderUserGrowthChart() {
    if (!this.userGrowthChart) {
      console.error('User Growth Chart element not found!');
      return;
    }

    this.userGrowthChartInstance?.destroy();
    this.userGrowthChartInstance = new Chart(this.userGrowthChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.Months,
        datasets: [
          {
            label: 'User Growth',
            data: this.userGrowthData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.3)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
      },
    });
  }

  renderActivityChart() {
    if (!this.activityChart) {
      console.error('Activity Chart element not found!');
      return;
    }

    this.activityChartInstance?.destroy();
    this.activityChartInstance = new Chart(this.activityChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Events', 'Alerts', 'Feedbacks'],
        datasets: [
          {
            label: 'User Activity',
            data: [this.eventCounts, this.alertCount, this.feedbackCount],
            backgroundColor: ['#22c55e', '#3b82f6', '#facc15'],
            borderRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
  }

  renderCategoryChart() {
    if (!this.categoryChart) {
      console.error('Category Chart element not found!');
      return;
    }

    this.categoryChartInstance?.destroy();
    this.categoryChartInstance = new Chart(this.categoryChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.communityCategoryData.labels,
        datasets: [
          {
            label: 'Category Distribution',
            data: this.communityCategoryData.counts,
            backgroundColor: ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#f43f5e', '#10b981'],
          },
        ],
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }
}
