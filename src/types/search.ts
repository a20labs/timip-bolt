// GraphQL Search Schema Types
export interface SearchResult {
  __typename: 'Track' | 'Release' | 'Artist' | 'Product' | 'Post';
  id: string;
  workspaceId: string;
}

export interface Track extends SearchResult {
  __typename: 'Track';
  title: string;
  isrc?: string;
  artistNames: string[];
  duration: number;
  key?: string;
  bpm?: number;
  releaseId?: string;
  coverUrl?: string;
  visibility: 'private' | 'workspace' | 'public';
}

export interface Release extends SearchResult {
  __typename: 'Release';
  title: string;
  upc?: string;
  date: string;
  trackCount: number;
  coverUrl?: string;
  artistNames: string[];
}

export interface Artist extends SearchResult {
  __typename: 'Artist';
  name: string;
  avatarUrl?: string;
  followerCount: number;
  verified?: boolean;
}

export interface Product extends SearchResult {
  __typename: 'Product';
  sku: string;
  name: string;
  price: number;
  currency: string;
  mediaUrl?: string;
  type: ProductType;
  inventory?: number;
}

export interface Post extends SearchResult {
  __typename: 'Post';
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  likesCount?: number;
}

enum ProductType {
  DIGITAL = 'DIGITAL',
  PHYSICAL = 'PHYSICAL',
  NFT = 'NFT'
}

export enum SearchScope {
  CATALOG = 'CATALOG',
  RELEASE = 'RELEASE', 
  PRODUCT = 'PRODUCT',
  POST = 'POST',
  ARTIST = 'ARTIST',
  ALL = 'ALL'
}

// Pagination Types
interface PageInfo {
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
  startCursor?: string;
}

interface SearchEdge {
  cursor: string;
  node: SearchResult;
}

export interface SearchConnection {
  edges: SearchEdge[];
  pageInfo: PageInfo;
  totalCount?: number;
}

// Search Facets
interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected?: boolean;
}

export interface SearchFacets {
  genre: SearchFacet;
  mood: SearchFacet;
  bpm: SearchFacet;
  key: SearchFacet;
  year: SearchFacet;
  type: SearchFacet;
  price: SearchFacet;
}

// Search Query Input
export interface SearchInput {
  query: string;
  first?: number;
  after?: string;
  scopes?: SearchScope[];
  filters?: SearchFilters;
}

interface SearchFilters {
  genre?: string[];
  mood?: string[];
  bpmRange?: [number, number];
  key?: string[];
  yearRange?: [number, number];
  priceRange?: [number, number];
  type?: ProductType[];
  hasLicense?: boolean;
  eduSafe?: boolean;
}