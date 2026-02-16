import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService, DashboardData } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData | null = null;
  isLoading = true;

  // Donut Chart Configuration (Plotly)
  public donutChartData: any[] = [];
  public donutChartLayout: any = {
    title: '',
    showlegend: true,
    legend: { orientation: 'h', y: -0.2 },
    margin: { t: 30, b: 30, l: 30, r: 30 }
  };
  public donutChartConfig: any = { responsive: true, displayModeBar: false };

  // Bar Chart Configuration (Plotly)
  public barChartData: any[] = [];
  public barChartLayout: any = {
    title: '',
    showlegend: true,
    margin: { t: 30, b: 80, l: 50, r: 30 },
    xaxis: { tickangle: -45 }
  };
  public barChartConfig: any = { responsive: true, displayModeBar: false };

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.setupCharts(data);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  setupCharts(data: DashboardData): void {
    if (data.chartDonut && data.chartDonut.length > 0) {
      const labels = data.chartDonut.map((item: any) => item.label || item.name);
      const values = data.chartDonut.map((item: any) => item.value);

      this.donutChartData = [{
        labels: labels,
        values: values,
        type: 'pie',
        hole: 0.4,
        marker: {
          colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }
      }];
    }

    if (data.chartbar && data.chartbar.length > 0) {
      const labels = data.chartbar.map((item: any) => item.label || item.name);
      const values = data.chartbar.map((item: any) => item.value);

      this.barChartData = [{
        x: labels,
        y: values,
        type: 'bar',
        name: 'Values',
        marker: {
          color: '#007bff'
        }
      }];
    }
  }

  getTableHeaders(): string[] {
    if (this.dashboardData && this.dashboardData.tableUsers.length > 0) {
      return Object.keys(this.dashboardData.tableUsers[0]);
    }
    return [];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
}
