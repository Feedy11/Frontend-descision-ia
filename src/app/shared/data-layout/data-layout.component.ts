import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DataSidebarComponent } from '../data-sidebar/data-sidebar.component';

@Component({
  selector: 'app-data-layout',
  imports: [RouterModule,DataSidebarComponent],
  templateUrl: './data-layout.component.html',
  styleUrl: './data-layout.component.css'
})
export class DataLayoutComponent {

}
