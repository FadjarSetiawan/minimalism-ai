import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-creator',
  standalone: true,
  template: `<p>Redirecting to unified chat...</p>`
})
export class ChatCreatorComponent {
  constructor(private router: Router) { this.router.navigate(['/chat']); }
}
