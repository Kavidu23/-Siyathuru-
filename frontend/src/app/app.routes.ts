import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiscoveryComponent } from './discovery/discovery.component';
import { AskaiComponent } from './askai/askai.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { CommunityProfileComponent } from './community-profile/community-profile.component';
import { CommunityCreateComponent } from './community-create/community-create.component';
import { CommunityDashboardComponent } from './community-dashboard/community-dashboard.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { ChartDashboardComponent } from './charts/charts.component';
import { SuperadminComponent } from './superadmin/superadmin.component';
import { ManagementComponent } from './management/management.component';
import { BlogComponent } from './blog/blog.component';
import { ProComponent } from './pro/pro.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirect '/' to '/home'
  { path: 'home', component: HomeComponent },
  { path: 'discover', component: DiscoveryComponent },
  { path: 'ask-ai', component: AskaiComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: 'community/:id', component: CommunityProfileComponent }, //there should be the id pass
  { path: 'create-community', component: CommunityCreateComponent },
  { path: 'community-dashboard', component: CommunityDashboardComponent },
  { path: 'chatbox', component: ChatboxComponent },
  { path: 'chart', component: ChartDashboardComponent },
  { path: 'superadmin', component: SuperadminComponent },
  { path: 'management', component: ManagementComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'pro', component: ProComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: 'home' },
];
