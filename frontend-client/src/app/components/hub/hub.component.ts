import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hub',
  standalone: true,
  template: `<p>Redirecting to chat...</p>`
})
export class HubComponent {
  constructor(private router: Router) { this.router.navigate(['/chat']); }
}
