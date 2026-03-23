import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IaServicesService } from '../../services/ia-services.service';

@Component({
  selector: 'app-data-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './data-sidebar.component.html',
  styleUrl: './data-sidebar.component.css'
})
export class DataSidebarComponent implements OnInit {


  datasetCount = 0;
  isAdmin      = false;

  constructor(private http: HttpClient,private auth: AuthService,private iaService:IaServicesService) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isSuperuser();
    this.loadCount();
  }

  private loadCount(): void {
    this.http.get<{ total: number }>(`${this.iaService.getAllDatasets()}/datasets/my-datasets?page=1&page_size=1`)
      .subscribe({
        next : (res) => { this.datasetCount = res.total ?? 0; },
        error: () => {}
      });
  }

  logout(): void {
    this.auth.logout();
  }
}
