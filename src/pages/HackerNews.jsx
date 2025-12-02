import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { X, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GitHubBadge from '@/components/GitHubBadge';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { fetchHNStories, getStoryUrl } from '@/lib/services/hnApi';
import ErrorBoundary from '@/components/ErrorBoundary';

const StoryCard = React.memo(({ story, onRemove, onLinkClick, clickedLinks }) => {
  const hasExternalUrl = Boolean(story.url);
  
  return (
    <div className={`story-card-enhanced group ${hasExternalUrl ? 'story-card-external' : 'story-card-discussion'} p-6 rounded-lg relative`}>
      <Button
        variant="ghost"
        size="icon"
        className="btn-remove absolute top-4 right-4"
        onClick={() => onRemove(story.objectID)}
        aria-label={`Remove story`}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="pr-12">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 mt-1">
            {hasExternalUrl ? (
              <ExternalLink className="h-4 w-4 text-primary" aria-label="External article" />
            ) : (
              <MessageSquare className="h-4 w-4 text-muted-foreground" aria-label="Discussion thread" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-hierarchy-base font-semibold leading-tight mb-2">
              {hasExternalUrl ? (
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    clickedLinks[story.objectID]
                      ? 'story-link-visited'
                      : 'story-link-primary'
                  }
                  onClick={() => onLinkClick(story.objectID)}
                  aria-label={`Read article: ${story.title}`}
                >
                  {story.title}
                </a>
              ) : (
                <a
                  href={getStoryUrl(story.objectID)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="story-link-primary"
                  aria-label={`View discussion: ${story.title}`}
                >
                  {story.title}
                </a>
              )}
            </h3>
            
            <div className="flex items-center gap-4 text-hierarchy-sm text-muted-foreground">
              <span className="font-medium text-foreground">{story.points} upvotes</span>
              <span className="text-border opacity-50">•</span>
              <a
                href={getStoryUrl(story.objectID)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors duration-200"
                aria-label={`View on Hacker News`}
              >
                {format(new Date(story.created_at), 'MMM d, yyyy')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(9)].map((_, index) => (
      <div key={index} className="story-card-enhanced p-6">
        <div className="flex items-start gap-3 mb-4">
          <Skeleton className="h-4 w-4 rounded-sm flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="ml-7 space-y-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ErrorMessage = ({ error, onRetry }) => (
  <div className="empty-state">
    <div className="max-w-md mx-auto">
      <h2 className="empty-state-title">Unable to Load Stories</h2>
      <p className="empty-state-description mb-8">{error.message}</p>
      <Button onClick={onRetry} size="lg" className="touch-target">
        Try Again
      </Button>
    </div>
  </div>
);

const HackerNews = () => {
  const [searchTerm, setSearchTerm] = useState('hn:,llm,gpt,claude,gemini,open,fast,tube,github,crunch,reddit,mcp,agent,ai ,rag ,cursor,google');
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
    
    // Remove duplicates by URL, keeping the older post
    const urlMap = new Map();
    data.hits.forEach(story => {
      if (story.url) {
        const existing = urlMap.get(story.url);
        if (!existing || new Date(story.created_at) < new Date(existing.created_at)) {
          urlMap.set(story.url, story);
        }
      } else {
        // For discussion-only posts without URL, use objectID as unique key
        urlMap.set(`discussion_${story.objectID}`, story);
      }
    });
    
    return Array.from(urlMap.values())
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
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <GitHubBadge />
        
        <header className="mb-12">
          <h1 className="text-hierarchy-2xl text-foreground mb-3">
            Top Hacker News Stories
          </h1>
          <p className="text-hierarchy-sm text-muted-foreground">
            Last week • {minPoints || 15}+ upvotes
          </p>
        </header>

        <div className="mb-12 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="form-group flex-1">
              <label htmlFor="search" className="form-label">
                Search Stories
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by title or URL (comma-separated terms)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                autoFocus
                aria-describedby="search-help"
              />
              <p id="search-help" className="text-hierarchy-xs text-muted-foreground mt-1">
                Use commas to separate multiple search terms
              </p>
            </div>
            <div className="form-group w-full lg:w-32">
              <label htmlFor="upvotes" className="form-label">
                Minimum Upvotes
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
                aria-describedby="upvotes-help"
              />
              <p id="upvotes-help" className="text-hierarchy-xs text-muted-foreground mt-1">
                Filter by story popularity
              </p>
            </div>
          </div>
        </div>
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorMessage error={error} onRetry={refetch} />
        ) : filteredStories.length === 0 ? (
          <div className="empty-state">
            <div className="max-w-md mx-auto">
              <h2 className="empty-state-title">No Stories Found</h2>
              <p className="empty-state-description">
                Try adjusting your search terms or lowering the minimum upvotes threshold to see more results.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
