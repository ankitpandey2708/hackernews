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
  <Card className="group story-card-hover relative">
    <Button
      variant="ghost"
      size="icon"
      className="story-remove-btn absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      onClick={() => onRemove(story.objectID)}
      aria-label="Remove story"
    >
      <X className="h-3.5 w-3.5" />
    </Button>
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold pr-12 leading-tight">
        {story.url ? (
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className={
              clickedLinks[story.objectID]
                ? 'story-link-visited'
                : 'story-link-unvisited'
            }
            onClick={() => onLinkClick(story.objectID)}
            aria-label={`Read story: ${story.title}`}
          >
            {story.title}
          </a>
        ) : (
          <span className="text-foreground">{story.title}</span>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium">{story.points} upvotes</span>
        <span className="text-border">•</span>
        <a
          href={getStoryUrl(story.objectID)}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
          aria-label="View on Hacker News"
        >
          {format(new Date(story.created_at), 'MMM d, yyyy')}
        </a>
      </div>
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
  <div className="flex flex-col items-center justify-center p-12">
    <div className="text-center max-w-md">
      <h2 className="text-xl font-semibold mb-3 text-foreground">Error Loading Stories</h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">{error.message}</p>
      <Button onClick={onRetry} variant="default">
        Try Again
      </Button>
    </div>
  </div>
);

const HackerNews = () => {
  const [searchTerm, setSearchTerm] = useState('hn:,llm,gpt,claude,gemini,open,fast,tube,github,crunch,reddit,mcp,agent,ai ,rag ,cursor');
  const [minPoints, setMinPoints] = useState('');
  const [clickedLinks, setClickedLinks] = useLocalStorage('clickedLinks', {});
  const [removedStories, setRemovedStories] = useLocalStorage('removedStories', {});

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['hnStories', minPoints],
    queryFn: () => fetchHNStories(minPoints ? parseInt(minPoints) : 15),
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
      <div className="container mx-auto px-4 py-6">
        <GitHubBadge />
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Top Hacker News Stories
          </h1>
          <p className="text-muted-foreground text-sm">
            Last week • {minPoints || 15}+ upvotes
          </p>
        </header>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
                Search Stories
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by title or URL (comma-separated for multiple terms)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
                aria-label="Search stories"
              />
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="upvotes" className="block text-sm font-medium text-foreground mb-2">
                Min Upvotes
              </label>
              <Input
                id="upvotes"
                type="number"
                placeholder="15"
                value={minPoints}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) > 0)) {
                    setMinPoints(value);
                  }
                }}
                className="w-full"
                min="1"
                aria-label="Minimum upvotes"
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorMessage error={error} onRetry={refetch} />
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">No stories found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search terms or minimum upvotes
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
