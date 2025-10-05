import { Component, AfterViewInit, ElementRef, ViewChild, OnInit, } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ViewportScroller } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-chart-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartDashboardComponent implements AfterViewInit, OnInit {

  constructor(private viewportScroller: ViewportScroller) { }

  ngOnInit(): void {
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  @ViewChild('userGrowthChart') userGrowthChart!: ElementRef;
  @ViewChild('activityChart') activityChart!: ElementRef;
  @ViewChild('categoryChart') categoryChart!: ElementRef;

  ngAfterViewInit(): void {
    this.renderUserGrowthChart();
    this.renderActivityChart();
    this.renderCategoryChart();
  }

  renderUserGrowthChart() {
    new Chart(this.userGrowthChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'User Growth',
          data: [100, 200, 400, 600, 800, 1200],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.3)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } }
      }
    });
  }

  renderActivityChart() {
    new Chart(this.activityChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Posts', 'Comments', 'Likes', 'Shares'],
        datasets: [{
          label: 'User Activity',
          data: [250, 400, 700, 300],
          backgroundColor: ['#22c55e', '#3b82f6', '#facc15', '#ef4444'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });
  }

  renderCategoryChart() {
    new Chart(this.categoryChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Education', 'Health', 'Environment', 'Community'],
        datasets: [{
          label: 'Category Distribution',
          data: [35, 25, 20, 20],
          backgroundColor: [
            '#3b82f6',
            '#22c55e',
            '#f97316',
            '#8b5cf6'
          ]
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}
