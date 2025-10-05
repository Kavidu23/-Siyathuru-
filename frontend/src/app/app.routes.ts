import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiscoveryComponent } from './discovery/discovery.component';
import { AskaiComponent } from './askai/askai.component';
import { LoginComponent } from './login/login.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { CommunityProfileComponent } from './community-profile/community-profile.component';
import { CommunityCreateComponent } from './community-create/community-create.component';
import { CommunityDashboardComponent } from './community-dashboard/community-dashboard.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { ChartDashboardComponent } from './charts/charts.component';
import { SuperadminComponent } from './superadmin/superadmin.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirect '/' to '/home'
    { path: 'home', component: HomeComponent },
    { path: 'discover', component: DiscoveryComponent },
    { path: "ask-ai", component: AskaiComponent },
    { path: 'login', component: LoginComponent },
    { path: 'user-dashboard', component: UserDashboardComponent },
    { path: 'community', component: CommunityProfileComponent }, //there should be the id pass
    { path: 'create-community', component: CommunityCreateComponent },
    { path: 'community-dashboard', component: CommunityDashboardComponent },
    { path: 'chatbox', component: ChatboxComponent },
    { path: 'chart', component: ChartDashboardComponent },
    { path: 'superadmin', component: SuperadminComponent }
];
