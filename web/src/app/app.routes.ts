import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {SessionComponent} from './session/session.component';
const routes: Routes = [
   {path: '', component: HomeComponent},
   {path: 'session/:id', component: SessionComponent}
//   {path: 'councillor/:id', component: CouncillorComponent,data:{"action":"read"}},
//   {path: 'councillor/:id/edit', component: CouncillorComponent,data:{"action":"edit"}},
//   {path: 'councillors/:county/:area', component: CouncillorComponent,data:{"action":"list"}},
//   {path: 'constituents/:county/:area', component: ConstituentComponent,data:{"action":"list"}},
//   {path: 'local/initiatives/:county/:area', component: InitiativesComponent,data:{"action":"list"}}
  // {path: 'newest/:page', component: StoriesComponent, data: {storiesType: 'newest'}},
  // {path: 'show/:page', component: StoriesComponent, data: {storiesType: 'show'}},
  // {path: 'ask/:page', component: StoriesComponent, data: {storiesType: 'ask'}},
  // {path: 'jobs/:page', component: StoriesComponent, data: {storiesType: 'jobs'}},
  // {path: 'item/:id', component: ItemCommentsComponent}
];

export const routing = RouterModule.forRoot(routes);

