import { SearchInput, SearchConnection, SearchResult, SearchScope, SearchFacets, Track, Release, Artist, Product, Post } from '../types/search';

// Mock search data for demonstration - optimized for smaller bundle
const mockTracks: Track[] = [
  {
    __typename: 'Track',
    id: '1',
    title: 'Midnight Dreams',
    isrc: 'USRC17607839',
    artistNames: ['Luna Rodriguez'],
    duration: 222,
    key: 'C minor',
    bpm: 120,
    releaseId: 'rel-1',
    workspaceId: 'demo-workspace',
    coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=300',
    visibility: 'public'
  },
  {
    __typename: 'Track',
    id: '2',
    title: 'Electric Nights',
    isrc: 'USRC17607840',
    artistNames: ['Luna Rodriguez'],
    duration: 258,
    key: 'A major',
    bpm: 128,
    releaseId: 'rel-2',
    workspaceId: 'demo-workspace',
    coverUrl: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300',
    visibility: 'public'
  }
];

const mockReleases: Release[] = [
  {
    __typename: 'Release',
    id: 'rel-1',
    title: 'Summer Vibes EP',
    upc: '123456789012',
    date: '2024-01-15',
    trackCount: 4,
    coverUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=300',
    artistNames: ['Luna Rodriguez'],
    workspaceId: 'demo-workspace'
  }
];

const mockArtists: Artist[] = [
  {
    __typename: 'Artist',
    id: 'artist-1',
    name: 'Luna Rodriguez',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
    followerCount: 12400,
    verified: true,
    workspaceId: 'demo-workspace'
  }
];

const mockProducts: Product[] = [
  {
    __typename: 'Product',
    id: 'prod-1',
    sku: 'VINYL-001',
    name: 'Midnight Dreams Vinyl',
    price: 2999,
    currency: 'USD',
    mediaUrl: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=300',
    type: 'PHYSICAL' as any,
    inventory: 150,
    workspaceId: 'demo-workspace'
  }
];

const mockPosts: Post[] = [
  {
    __typename: 'Post',
    id: 'post-1',
    title: 'New Track Coming Soon!',
    body: 'Just finished recording a new track! Can\'t wait to share it with you all.',
    authorId: 'artist-1',
    authorName: 'Luna Rodriguez',
    createdAt: '2024-01-10T10:00:00Z',
    likesCount: 47,
    workspaceId: 'demo-workspace'
  }
];

class SearchService {
  private getAllResults(): SearchResult[] {
    return [
      ...mockTracks,
      ...mockReleases,
      ...mockArtists,
      ...mockProducts,
      ...mockPosts
    ];
  }

  private filterByScope(results: SearchResult[], scopes: SearchScope[]): SearchResult[] {
    if (scopes.includes(SearchScope.ALL)) {
      return results;
    }

    return results.filter(result => {
      switch (result.__typename) {
        case 'Track':
          return scopes.includes(SearchScope.CATALOG);
        case 'Release':
          return scopes.includes(SearchScope.RELEASE);
        case 'Artist':
          return scopes.includes(SearchScope.ARTIST);
        case 'Product':
          return scopes.includes(SearchScope.PRODUCT);
        case 'Post':
          return scopes.includes(SearchScope.POST);
        default:
          return false;
      }
    });
  }

  private filterByQuery(results: SearchResult[], query: string): SearchResult[] {
    if (!query.trim()) return results;

    const searchTerm = query.toLowerCase();
    
    return results.filter(result => {
      switch (result.__typename) {
        case 'Track':
          const track = result as Track;
          return track.title.toLowerCase().includes(searchTerm) ||
                 track.artistNames.some(name => name.toLowerCase().includes(searchTerm));
        
        case 'Release':
          const release = result as Release;
          return release.title.toLowerCase().includes(searchTerm) ||
                 release.artistNames.some(name => name.toLowerCase().includes(searchTerm));
        
        case 'Artist':
          const artist = result as Artist;
          return artist.name.toLowerCase().includes(searchTerm);
        
        case 'Product':
          const product = result as Product;
          return product.name.toLowerCase().includes(searchTerm);
        
        case 'Post':
          const post = result as Post;
          return post.title.toLowerCase().includes(searchTerm) ||
                 post.body.toLowerCase().includes(searchTerm);
        
        default:
          return false;
      }
    });
  }

  async search(input: SearchInput): Promise<SearchConnection> {
    const { query, first = 20, after, scopes = [SearchScope.ALL] } = input;
    
    let results = this.getAllResults();
    results = this.filterByScope(results, scopes);
    results = this.filterByQuery(results, query);

    let startIndex = 0;
    if (after) {
      try {
        const cursorData = JSON.parse(atob(after));
        startIndex = cursorData.index + 1;
      } catch {
        startIndex = 0;
      }
    }

    const endIndex = startIndex + first;
    const paginatedResults = results.slice(startIndex, endIndex);
    const hasNextPage = endIndex < results.length;

    const edges = paginatedResults.map((result, index) => ({
      cursor: btoa(JSON.stringify({ timestamp: Date.now(), id: result.id, index: startIndex + index })),
      node: result
    }));

    return {
      edges,
      pageInfo: {
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
        hasNextPage,
        hasPreviousPage: startIndex > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : undefined
      },
      totalCount: results.length
    };
  }

  async searchFacets(): Promise<SearchFacets> {
    return {
      genre: {
        field: 'genre',
        values: [
          { value: 'Electronic', count: 15 },
          { value: 'Pop', count: 12 },
          { value: 'Rock', count: 8 }
        ]
      },
      mood: {
        field: 'mood',
        values: [
          { value: 'Energetic', count: 10 },
          { value: 'Chill', count: 8 }
        ]
      },
      bpm: {
        field: 'bpm',
        values: [
          { value: '90-120', count: 15 },
          { value: '120-140', count: 20 }
        ]
      },
      key: {
        field: 'key',
        values: [
          { value: 'C major', count: 8 },
          { value: 'A minor', count: 6 }
        ]
      },
      year: {
        field: 'year',
        values: [
          { value: '2024', count: 25 },
          { value: '2023', count: 18 }
        ]
      },
      type: {
        field: 'type',
        values: [
          { value: 'Track', count: 35 },
          { value: 'Release', count: 12 }
        ]
      },
      price: {
        field: 'price',
        values: [
          { value: 'Free', count: 20 },
          { value: '$1-10', count: 15 }
        ]
      }
    };
  }
}

export const searchService = new SearchService();