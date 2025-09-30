import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiscoveryComponent } from './discovery/discovery.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirect '/' to '/home'
    { path: 'home', component: HomeComponent },
    { path: 'discover', component: DiscoveryComponent }
];
