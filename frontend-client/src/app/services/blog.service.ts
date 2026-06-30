import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private posts: BlogPost[] = [
    {
      slug: 'apa-itu-minimalism-ai',
      title: 'Mengenal Minimalism AI: Cepat dan Tepat',
      description: 'Penjelasan mendalam tentang mengapa Minimalism AI diciptakan, dan bagaimana hal tersebut dapat mempercepat alur kerja.',
      content: '<p>Minimalism AI adalah sebuah platform yang difokuskan pada kecepatan dan presisi. Tanpa fitur berlebihan, hanya alat yang benar-benar Anda butuhkan seperti Socratic Tutoring, Code Compiler, dan Flux Visual Generator.</p>',
      date: '2026-06-30'
    },
    {
      slug: 'optimasi-seo-untuk-ai-web',
      title: 'Strategi Optimasi SEO untuk Aplikasi Web AI',
      description: 'Pentingnya mengimplementasikan Server-Side Rendering (SSR) untuk aplikasi web modern yang berbasis AI.',
      content: '<p>Aplikasi web modern seringkali menggunakan framework SPA seperti Angular atau React. Untuk SEO, Server-Side Rendering (SSR) adalah sebuah kewajiban agar bot pencari seperti Google bisa membaca konten situs Anda dengan benar.</p>',
      date: '2026-06-28'
    }
  ];

  constructor() { }

  getPosts(): Observable<BlogPost[]> {
    return of(this.posts);
  }

  getPostBySlug(slug: string): Observable<BlogPost | undefined> {
    const post = this.posts.find(p => p.slug === slug);
    return of(post);
  }
}
