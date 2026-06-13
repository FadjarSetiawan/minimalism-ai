import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-general',
  standalone: true,
  template: `<p>Redirecting to unified chat...</p>`
})
export class ChatGeneralComponent {
  constructor(private router: Router) { this.router.navigate(['/chat']); }
}
