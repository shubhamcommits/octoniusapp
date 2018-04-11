import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';




import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { WelcomePageComponent } from './Authentication/welcome-page/welcome-page.component';
import { SignupComponent } from './Authentication/signup/signup.component';
import { SigninComponent } from './Authentication/signin/signin.component';
import { NewWorkspacePage1Component } from './Authentication/new-workspace-page-1/new-workspace-page-1.component';
import { NewWorkspacePage2Component } from './Authentication/new-workspace-page-2/new-workspace-page-2.component';


const appRoutes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'create-new-Workspace-page2', component: NewWorkspacePage2Component },
  { path: 'create-new-Workspace-page1', component: NewWorkspacePage1Component },
];

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    SignupComponent,
    SigninComponent,
    NewWorkspacePage1Component,
    NewWorkspacePage2Component
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
