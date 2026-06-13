import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { ModelsComponent } from './components/models/models.component';
import { ChatComponent } from './components/chat/chat.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  // Public Pages
  { path: '', component: LandingComponent },
  { path: 'pricing', component: PricingComponent },
  { path: 'models', component: ModelsComponent },

  // Auth Pages
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Core Product (Protected)
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },

  // Admin Shadow Panel (Hidden)
  { path: 'nexus-command-x9', component: AdminPanelComponent },

  // Fallback
  { path: '**', redirectTo: '' }
];
