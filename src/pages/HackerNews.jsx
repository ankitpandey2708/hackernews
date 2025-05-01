import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GitHubBadge from '@/components/GitHubBadge';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { fetchHNStories, getStoryUrl } from '@/lib/services/hnApi';
import ErrorBoundary from '@/components/ErrorBoundary';

const StoryCard = React.memo(({ story, onRemove, onLinkClick, clickedLinks }) => (
  <Card className="relative">
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
      onClick={() => onRemove(story.objectID)}
      aria-label="Remove story"
    >
      <X className="h-4 w-4" />
    </Button>
    <CardHeader>
      <CardTitle className="text-lg pr-8">
        {story.url ? (
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              clickedLinks[story.objectID]
                ? 'text-gray-500 no-underline hover:no-underline'
                : 'text-blue-500 hover:underline'
            }`}
            onClick={() => onLinkClick(story.objectID)}
            aria-label={`Read story: ${story.title}`}
          >
            {story.title}
          </a>
        ) : (
          <span className="text-black">{story.title}</span>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-500 mb-2">
        Upvotes: {story.points} | {' '}
        <a
          href={getStoryUrl(story.objectID)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
          aria-label="View on Hacker News"
        >
          Created: {format(new Date(story.created_at), 'MMM d, yyyy')}
        </a>
      </p>
    </CardContent>
  </Card>
));

const LoadingSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(9)].map((_, index) => (
      <Card key={index}>
        <CardHeader>
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-[200px]" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const ErrorMessage = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <h2 className="text-2xl font-bold mb-4">Error Loading Stories</h2>
    <p className="text-gray-600 mb-4">{error.message}</p>
    <Button onClick={onRetry}>Retry</Button>
  </div>
);

const HackerNews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clickedLinks, setClickedLinks] = useLocalStorage('clickedLinks', {});
  const [removedStories, setRemovedStories] = useLocalStorage('removedStories', {});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['hnStories'],
    queryFn: fetchHNStories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const sortedStories = useMemo(() => {
    if (!data) return [];
    return [...data.hits]
      .sort((a, b) => b.points - a.points)
      .filter(story => !clickedLinks[story.objectID] && !removedStories[story.objectID]);
  }, [data, clickedLinks, removedStories]);

  const filteredStories = useMemo(() => {
    if (!searchTerm.trim()) return sortedStories;
    
    // Split search terms by comma and not using trim()
    const searchTerms = searchTerm
      .split(',')
      .map(term => term.toLowerCase())
      .filter(term => term.length > 0);
    
    if (searchTerms.length === 0) return sortedStories;
    
    return sortedStories.filter(story => {
      const title = story.title ? story.title.toLowerCase() : '';
      const url = story.url ? story.url.toLowerCase() : '';
      
      // Return true if ANY of the search terms match (OR logic)
      return searchTerms.some(term => 
        title.includes(term) || url.includes(term)
      );
    });
  }, [sortedStories, searchTerm]);

  const handleLinkClick = (objectID) => {
    setClickedLinks(prev => ({ ...prev, [objectID]: true }));
  };

  const handleRemoveStory = (storyId) => {
    setRemovedStories(prev => ({ ...prev, [storyId]: true }));
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-4">
        <GitHubBadge />
        <h1 className="text-3xl font-bold mb-6">Top Hacker News Stories (Last Week, 10+ Upvotes)</h1>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search stories (comma-separated for multiple terms)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
            autoFocus
            aria-label="Search stories"
          />
        </div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorMessage error={error} onRetry={refetch} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <StoryCard
                key={story.objectID}
                story={story}
                onRemove={handleRemoveStory}
                onLinkClick={handleLinkClick}
                clickedLinks={clickedLinks}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default HackerNews;
