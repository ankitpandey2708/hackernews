import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { X, ExternalLink, MessageSquare, TrendingUp, Search, Filter, RefreshCw, Inbox, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { fetchHNStories, getStoryUrl } from '@/lib/services/hnApi';
import ErrorBoundary from '@/components/ErrorBoundary';

// Story Card Component with Neo-Editorial styling
const StoryCard = React.memo(({ story, onRemove, onLinkClick, clickedLinks, index }) => {
  const hasExternalUrl = Boolean(story.url);
  const isVisited = clickedLinks[story.objectID];

  // Stagger animation delay based on index (limited to 12 for performance)
  const staggerClass = index < 12 ? `stagger-${index + 1}` : '';

  return (
    <article
      className={`story-card group animate-slide-up ${staggerClass}`}
      role="article"
      aria-label={story.title}
    >
      {/* Accent line that reveals on hover */}
      <div className="story-card-accent" aria-hidden="true" />

      {/* Dismiss button */}
      <button
        className="btn-dismiss touch-target"
        onClick={() => onRemove(story.objectID)}
        aria-label={`Remove story`}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="pr-10">
        {/* Type indicator and title */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`story-type-badge flex-shrink-0 mt-0.5 ${hasExternalUrl ? 'external' : 'discussion'}`}
            title={hasExternalUrl ? 'External article' : 'Discussion thread'}
          >
            {hasExternalUrl ? (
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </div>

          <h2 className="flex-1 min-w-0">
            {hasExternalUrl ? (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`story-title ${isVisited ? 'story-title-visited' : ''}`}
                onClick={() => onLinkClick(story.objectID)}
              >
                {story.title}
              </a>
            ) : (
              <a
                href={getStoryUrl(story.objectID)}
                target="_blank"
                rel="noopener noreferrer"
                className="story-title"
              >
                {story.title}
              </a>
            )}
          </h2>
        </div>

        {/* Meta information */}
        <div className="story-meta ml-10">
          <span className="story-points">
            <TrendingUp className="w-3 h-3" aria-hidden="true" />
            {story.points}
          </span>

          <span className="text-border/30" aria-hidden="true">•</span>

          <a
            href={getStoryUrl(story.objectID)}
            target="_blank"
            rel="noopener noreferrer"
            className="story-date hover:text-foreground transition-colors"
            title={`View on Hacker News`}
          >
            {format(new Date(story.created_at), 'MMM d, yyyy')}
          </a>
        </div>
      </div>
    </article>
  );
});

StoryCard.displayName = 'StoryCard';

// Loading Skeleton with shimmer effect
const LoadingSkeleton = () => (
  <div className="story-grid">
    {[...Array(9)].map((_, index) => (
      <div
        key={index}
        className={`story-card animate-fade-in stagger-${index + 1}`}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="skeleton w-7 h-7 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-4/5 rounded" />
          </div>
        </div>
        <div className="ml-10 flex items-center gap-3">
          <div className="skeleton h-5 w-14 rounded-full" />
          <div className="skeleton h-3 w-2 rounded-full" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry, isRetrying }) => (
  <div className="empty-state animate-fade-up">
    <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
      <RefreshCw className={`w-8 h-8 text-destructive ${isRetrying ? 'animate-spin' : ''}`} />
    </div>
    <h2 className="empty-state-title">Connection Lost</h2>
    <p className="empty-state-description mb-8">
      {error.message || 'Unable to fetch stories. Please check your connection and try again.'}
    </p>
    <button
      onClick={onRetry}
      className="btn-primary touch-target"
      disabled={isRetrying}
    >
      {isRetrying ? 'Retrying...' : 'Try Again'}
    </button>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="empty-state animate-fade-up">
    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
      <Inbox className="w-8 h-8 text-muted-foreground/50" />
    </div>
    <h2 className="empty-state-title">No Stories Found</h2>
    <p className="empty-state-description">
      Adjust your search filters or lower the minimum upvotes threshold to discover more content.
    </p>
  </div>
);

// Main Component
const HackerNews = () => {
  const [searchTerm, setSearchTerm] = useState('hn:,llm,gpt,claude,gemini,open,fast,tube,github,crunch,reddit,mcp,agent,ai ,rag ,cursor,google');
  const [minPoints, setMinPoints] = useState('');
  const [clickedLinks, setClickedLinks] = useLocalStorage('clickedLinks', {});
  const [removedStories, setRemovedStories] = useLocalStorage('removedStories', {});
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['hnStories', minPoints],
    queryFn: () => fetchHNStories(minPoints ? parseInt(minPoints) : 15),
    staleTime: 5 * 60 * 1000,
  });

  // Process and filter stories
  const sortedStories = useMemo(() => {
    if (!data) return [];

    const urlMap = new Map();
    data.hits.forEach(story => {
      if (story.url) {
        const existing = urlMap.get(story.url);
        if (!existing || new Date(story.created_at) < new Date(existing.created_at)) {
          urlMap.set(story.url, story);
        }
      } else {
        urlMap.set(`discussion_${story.objectID}`, story);
      }
    });

    return Array.from(urlMap.values())
      .sort((a, b) => b.points - a.points)
      .filter(story => !clickedLinks[story.objectID] && !removedStories[story.objectID]);
  }, [data, clickedLinks, removedStories]);

  const filteredStories = useMemo(() => {
    if (!searchTerm.trim()) return sortedStories;

    const searchTerms = searchTerm
      .split(',')
      .map(term => term.toLowerCase())
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) return sortedStories;

    return sortedStories.filter(story => {
      const title = story.title ? story.title.toLowerCase() : '';
      const url = story.url ? story.url.toLowerCase() : '';
      return searchTerms.some(term => title.includes(term) || url.includes(term));
    });
  }, [sortedStories, searchTerm]);

  const handleLinkClick = (objectID) => {
    setClickedLinks(prev => ({ ...prev, [objectID]: Date.now() }));
  };

  const handleRemoveStory = (storyId) => {
    setRemovedStories(prev => ({ ...prev, [storyId]: Date.now() }));
  };

  return (
    <ErrorBoundary>
      <Helmet>
        <title>HN Digest — Curated Tech Intelligence</title>
        <meta name="description" content="Stay ahead with HN Digest - your curated source for top Hacker News stories. Filter by category, points, and date to discover trending tech news, discussions, and insights from the developer community." />
        <link rel="canonical" href="https://hackernews.lovable.app/" />
      </Helmet>
      <div className="min-h-screen">
        {/* Main container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

          {/* Editorial Header */}
          <header className="mb-12 sm:mb-16 animate-fade-up">
            {/* Issue label */}
            <div className="mono-label mb-4">
              Weekly Digest
            </div>

            {/* Main headline */}
            <h1 className="headline-editorial text-foreground mb-4">
              <span className="header-accent">Tech Intelligence</span>
            </h1>

            {/* Subheadline */}
            <p className="subheadline">
              Curated stories from Hacker News &mdash; {minPoints || 15}+ upvotes
            </p>
          </header>

          {/* Decorative separator */}
          <div className="separator-ornament animate-fade-up stagger-2" aria-hidden="true">
            ◆
          </div>

          {/* Filter Controls - Collapsible */}
          <section
            className="mb-10 sm:mb-12 animate-fade-up stagger-3"
            aria-label="Story filters"
          >
            {/* Toggle Button */}
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
              aria-expanded={isFiltersExpanded}
              aria-controls="filter-content"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-mono text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Filters
                </span>
                {(searchTerm || minPoints) && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-mono">
                    Active
                  </span>
                )}
              </div>
              {isFiltersExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            {/* Collapsible Content */}
            <div
              id="filter-content"
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isFiltersExpanded ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 rounded-lg bg-card/50 border border-border/50">
                {/* Search input */}
                <div className="flex-1">
                  <label htmlFor="search" className="input-label flex items-center gap-2">
                    <Search className="w-3 h-3" aria-hidden="true" />
                    Search Stories
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Enter keywords, separated by commas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-neo"
                      aria-describedby="search-hint"
                    />
                  </div>
                  <p id="search-hint" className="mt-2 text-xs text-muted-foreground/60 font-mono">
                    Comma-separated terms use OR logic
                  </p>
                </div>

                {/* Min points filter */}
                <div className="w-full lg:w-40">
                  <label htmlFor="upvotes" className="input-label flex items-center gap-2">
                    <Filter className="w-3 h-3" aria-hidden="true" />
                    Min Upvotes
                  </label>
                  <input
                    id="upvotes"
                    type="number"
                    placeholder="15"
                    value={minPoints}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || parseInt(value) > 0) {
                        setMinPoints(value);
                      }
                    }}
                    className="input-neo"
                    min="1"
                    aria-describedby="upvotes-hint"
                  />
                  <p id="upvotes-hint" className="mt-2 text-xs text-muted-foreground/60 font-mono">
                    Filters by popularity
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Results count */}
          {!isLoading && !isError && filteredStories.length > 0 && (
            <div className="mb-6 font-mono text-xs text-muted-foreground animate-fade-in">
              Showing <span className="text-primary font-semibold">{filteredStories.length}</span> stories
            </div>
          )}

          {/* Content Area */}
          <main>
            {isLoading ? (
              <LoadingSkeleton />
            ) : isError ? (
              <ErrorState error={error} onRetry={refetch} isRetrying={isFetching} />
            ) : filteredStories.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="story-grid">
                {filteredStories.map((story, index) => (
                  <StoryCard
                    key={story.objectID}
                    story={story}
                    onRemove={handleRemoveStory}
                    onLinkClick={handleLinkClick}
                    clickedLinks={clickedLinks}
                    index={index}
                  />
                ))}
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border/50 animate-fade-in">
            <div className="flex items-center justify-center gap-4">
              <p className="font-mono text-xs text-muted-foreground/50">
                Powered by <a href="https://hn.algolia.com/api" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Algolia HN API</a>
              </p>
              <span className="text-border/30">•</span>
              <a
                href="https://github.com/ankitpandey2708/hackernews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-muted-foreground/50 hover:text-primary transition-colors"
                aria-label="View source on GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HackerNews;
