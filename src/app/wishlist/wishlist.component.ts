import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../core/service/wishlist.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Movie } from '../core/interface/Movie';
import { Router, RouterLink } from '@angular/router';
import { TruncatePipe } from "../core/pipe/truncate.pipe";
import { DatePipe, SlicePipe } from '@angular/common';


@Component({
  selector: 'app-wishlist',
  imports: [TruncatePipe, DatePipe,RouterLink,SlicePipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent implements OnInit {
  wishlist$: Observable<Movie[]>;
  
  movie!: Movie;
  movies: Movie[] = [];
  isInWishlist: boolean = false;
  constructor(
    private _wishlistService: WishlistService,
    private _router: Router
    
  ) {
    this._wishlistService.getWishlist().subscribe((movies) => {
      this.movies = movies;
      console.log('Wishlist movies:', this.movies);
    });

    this.wishlist$ = this._wishlistService.getWishlist();
    console.log(this.wishlist$);
  }
  ngOnInit(): void {}

  navigateToMovie(movieId: number): void {
    this._router.navigate(['/movie', movieId]);
  }

  navigateToHome(): void {
    this._router.navigate(['/']);
  }
 removeFromWatchList(movieId:number): void {
    this._wishlistService.removeFromWishlist(movieId);
    
  }

  get heartIconClass(): string {
      return `fa-heart favorite-icon me-5  fa-solid` ;
    ;
  }
}
