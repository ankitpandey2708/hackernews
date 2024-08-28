import React, { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subWeeks } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';

const ITEMS_PER_PAGE = 30;

const fetchHNStories = async ({ pageParam = 0 }) => {
  const oneWeekAgo = Math.floor(subWeeks(new Date(), 1).getTime() / 1000);
  const response = await fetch(`https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${oneWeekAgo},points>=10&hitsPerPage=${ITEMS_PER_PAGE}&page=${pageParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HackerNews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStories, setFilteredStories] = useState([]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ['hnStories'],
    queryFn: fetchHNStories,
    getNextPageParam: (lastPage, pages) => lastPage.page + 1,
  });

  const filterStories = useCallback(() => {
    if (!data) return [];
    const allStories = data.pages.flatMap(page => page.hits);
    return allStories.filter(story =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  useEffect(() => {
    setFilteredStories(filterStories());
  }, [filterStories, data]);

  if (isError) return <div>An error occurred: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Top Hacker News Stories (Last Week, 10+ Upvotes)</h1>
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {isLoading ? (
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
      ) : (
        <InfiniteScroll
          dataLength={filteredStories.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={<h4>Loading...</h4>}
        >
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <Card key={story.objectID}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {story.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-2">
                    Upvotes: {story.points} | {' '}
                    <a
                      href={`https://news.ycombinator.com/item?id=${story.objectID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Created: {format(new Date(story.created_at), 'MMM d, yyyy')}
                    </a>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default HackerNews;
