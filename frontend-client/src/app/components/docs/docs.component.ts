import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-docs',
  standalone: true,
  template: `<p>Redirecting to models...</p>`
})
export class DocsComponent {
  constructor(private router: Router) { this.router.navigate(['/models']); }
}
