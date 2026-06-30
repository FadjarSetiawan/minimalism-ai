import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { BlogService, BlogPost } from '../../services/blog.service';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | undefined;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.blogService.getPostBySlug(slug).subscribe(data => {
          this.post = data;
          if (this.post) {
            // Dynamic SEO Meta Tags for Article
            this.titleService.setTitle(`${this.post.title} - Minimalism AI`);
            this.metaService.updateTag({ name: 'description', content: this.post.description });
            this.metaService.updateTag({ property: 'og:title', content: this.post.title });
            this.metaService.updateTag({ property: 'og:description', content: this.post.description });
            this.metaService.updateTag({ property: 'og:type', content: 'article' });
          } else {
            this.titleService.setTitle('Artikel Tidak Ditemukan - Minimalism AI');
          }
        });
      }
    });
  }
}
