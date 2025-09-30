import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiscoveryComponent } from './discovery/discovery.component';
import { AskaiComponent } from './askai/askai.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirect '/' to '/home'
    { path: 'home', component: HomeComponent },
    { path: 'discover', component: DiscoveryComponent },
    { path: "ask-ai", component: AskaiComponent },
    { path: 'login', component: LoginComponent }
];
