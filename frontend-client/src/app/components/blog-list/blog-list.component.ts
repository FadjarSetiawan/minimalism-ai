import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { BlogService, BlogPost } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];

  constructor(
    private blogService: BlogService,
    private titleService: Title,
    private metaService: Meta
  ) {}

  ngOnInit(): void {
    // Set SEO Meta for Blog List Page
    this.titleService.setTitle('Blog - Minimalism AI');
    this.metaService.updateTag({ name: 'description', content: 'Kumpulan artikel dan update terbaru seputar Minimalism AI, teknologi, dan SEO.' });

    this.blogService.getPosts().subscribe(data => {
      this.posts = data;
    });
  }
}
