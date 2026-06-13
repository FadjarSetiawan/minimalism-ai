import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-student',
  standalone: true,
  template: `<p>Redirecting to unified chat...</p>`
})
export class ChatStudentComponent {
  constructor(private router: Router) { this.router.navigate(['/chat']); }
}
