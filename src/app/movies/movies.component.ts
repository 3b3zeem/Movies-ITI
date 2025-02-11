import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { RequestsService } from '../core/service/requests.service';
import { Movie } from '../core/interface/Movie';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TruncatePipe } from '../core/pipe/truncate.pipe';
import { UpToTopComponent } from '../up-to-top/up-to-top.component';
import { WishlistService } from '../core/service/wishlist.service';
import { LanguagesService } from '../core/service/languages.service';

@Component({
  selector: 'app-movies',
  imports: [
    RouterModule,
    CommonModule,
    TruncatePipe,
    UpToTopComponent,
    FormsModule,
  ],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css'],
})
export class MoviesComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  isInWishlist: boolean = false;
  selectedLanguage: string = 'en-US';
  searchTerm: string = '';
  isLoading: boolean = true; // Add the isLoading variable

  constructor(
    private requests: RequestsService,
    private _wishlistService: WishlistService,
    private languageService: LanguagesService
  ) {}

  ngOnInit() {
    this.languageService.currentLanguage$.subscribe((lang) => {
      this.selectedLanguage = lang;
      this.fetchMoviesWithLanguage();
    });

    this.fetchMovies();
  }

  fetchMovies() {
    this.isLoading = true; // Start loading
    this.searchTerm = '';
    this.requests.getNowPlayingMovies(this.currentPage).subscribe(
      (res) => {
        this.movies = res.results;
        this.filteredMovies = res.results;
        this.totalPages = res.total_pages;
        setTimeout(() => {
          this.isLoading = false; // End loading on error
        }, 500);
      },
      (error) => {
        console.error(error);
        setTimeout(() => {
          this.isLoading = false; // End loading on error
        }, 500);
      }
    );
  }

  fetchMoviesWithLanguage() {
    this.isLoading = true;
    this.requests
      .getMoviesWithLanguages(this.selectedLanguage)
      .subscribe((res) => {
        this.movies = res.results;
        this.filteredMovies = [...this.movies];
        console.log(this.filteredMovies);
        setTimeout(() => {
          this.isLoading = false; // End loading on error
        }, 500);
      });
  }

  filterMovies() {
    this.isLoading = true;
    this.currentPage = 1;
    const term = this.searchTerm.trim();

    if (term) {
      this.requests.filterMovies(term, this.currentPage).subscribe((res) => {
        this.filteredMovies = res.results;
        this.totalPages = res.total_pages;
      });
      setTimeout(() => {
        this.isLoading = false; // End loading on error
      }, 500);
    } else {
      this.filteredMovies = [...this.movies];
      setTimeout(() => {
        this.isLoading = false; // End loading on error
      }, 500);
    }
  }

  toggleWishlist(movie: Movie): void {
    if (this._wishlistService.isInWishlist(movie.id)) {
      this._wishlistService.removeFromWishlist(movie.id);
    } else {
      this._wishlistService.addToWishlist(movie);
    }
  }

  getHeartIconClass(movie: Movie): string {
    return `fa-heart favorite-icon me-5 ${
      this._wishlistService.isInWishlist(movie.id) ? 'fa-solid' : 'fa-regular'
    }`;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      const term = this.searchTerm.trim();

      if (term) {
        // Use the search filter for pagination
        this.requests.filterMovies(term, this.currentPage).subscribe((res) => {
          this.filteredMovies = res.results;
          this.totalPages = res.total_pages;
          // Scroll to the top after loading the filtered movies
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        // Regular pagination without filtering
        this.requests.getNowPlayingMovies(this.currentPage).subscribe((res) => {
          this.movies = res.results;
          this.filteredMovies = res.results;
          this.totalPages = res.total_pages;
          // Scroll to the top after loading the movies
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    }
  }

  getPaginationPages(): number[] {
    let pages: number[] = [];
    const totalToShow = 5;
    let start = Math.max(1, this.currentPage - Math.floor(totalToShow / 2));
    let end = Math.min(this.totalPages, start + totalToShow - 1);

    if (end - start < totalToShow - 1) {
      start = Math.max(1, end - (totalToShow - 1));
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  calcProgress(voteAverage: number): number {
    const percentage = (voteAverage / 10) * 113;
    return 113 - percentage;
  }
}
