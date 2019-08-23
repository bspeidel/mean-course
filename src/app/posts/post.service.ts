import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private httpClient: HttpClient) {}

  getPosts() {
    this.httpClient
      .get<{ message: string; posts: any }>('http://localhost:3000/api/posts')
      .pipe(
        map(data => {
          return data.posts.map(post => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
            };
          });
        })
      )
      .subscribe(data => {
        this.posts = data;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.httpClient
      .post<{ message: string; id: string }>(
        'http://localhost:3000/api/posts',
        post
      )
      .subscribe(data => {
        post.id = data.id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(id: string) {
    this.httpClient
      .delete('http://localhost:3000/api/posts/' + id)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post.id !== id);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
