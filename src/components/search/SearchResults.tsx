import React from 'react';
import { motion } from 'framer-motion';
import { 
  Music, 
  Disc3, 
  User, 
  ShoppingBag, 
  MessageSquare,
  Play,
  Heart,
  ExternalLink,
  Clock
} from 'lucide-react';
import { SearchResult, Track, Release, Artist, Product, Post } from '../../types/search';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface SearchResultsProps {
  results: SearchResult[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasNextPage?: boolean;
}

export function SearchResults({ results, loading, onLoadMore, hasNextPage }: SearchResultsProps) {
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'Track': return Music;
      case 'Release': return Disc3;
      case 'Artist': return User;
      case 'Product': return ShoppingBag;
      case 'Post': return MessageSquare;
      default: return Music;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'Track': return 'text-blue-600';
      case 'Release': return 'text-purple-600';
      case 'Artist': return 'text-green-600';
      case 'Product': return 'text-orange-600';
      case 'Post': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(price / 100);
  };

  const renderTrack = (track: Track) => (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Play className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {track.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {track.artistNames.join(', ')} • {formatDuration(track.duration)}
        </p>
        {track.key && track.bpm && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {track.key} • {track.bpm} BPM
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Play className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderRelease = (release: Release) => (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        {release.coverUrl ? (
          <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {release.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {release.artistNames.join(', ')} • {release.trackCount} tracks
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Released {new Date(release.date).toLocaleDateString()}
        </p>
      </div>
      <Button variant="ghost" size="sm">
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );

  const renderArtist = (artist: Artist) => (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
        {artist.avatarUrl ? (
          <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-2">
          {artist.name}
          {artist.verified && (
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {artist.followerCount.toLocaleString()} followers
        </p>
      </div>
      <Button variant="outline" size="sm">
        Follow
      </Button>
    </div>
  );

  const renderProduct = (product: Product) => (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        {product.mediaUrl ? (
          <img src={product.mediaUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatPrice(product.price, product.currency)} • {product.type}
        </p>
        {product.inventory && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {product.inventory} in stock
          </p>
        )}
      </div>
      <Button size="sm">
        Add to Cart
      </Button>
    </div>
  );

  const renderPost = (post: Post) => (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <MessageSquare className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {post.body}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
          <span>{post.authorName}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          {post.likesCount && (
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {post.likesCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderResult = (result: SearchResult) => {
    switch (result.__typename) {
      case 'Track':
        return renderTrack(result as Track);
      case 'Release':
        return renderRelease(result as Release);
      case 'Artist':
        return renderArtist(result as Artist);
      case 'Product':
        return renderProduct(result as Product);
      case 'Post':
        return renderPost(result as Post);
      default:
        return null;
    }
  };

  if (results.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No results found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const Icon = getResultIcon(result.__typename);
        const colorClass = getResultColor(result.__typename);

        return (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  {renderResult(result)}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {hasNextPage && !loading && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
}