import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subWeeks } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const fetchHNStories = async () => {
  const oneWeekAgo = Math.floor(subWeeks(new Date(), 1).getTime() / 1000);
  const response = await fetch(`https://hn.algolia.com/api/v1/search?tags=story&numericFilters=created_at_i>${oneWeekAgo},points>=10&hitsPerPage=1000`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const HackerNews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedStories, setSortedStories] = useState([]);
  const [clickedLinks, setClickedLinks] = useState(() => {
    const saved = localStorage.getItem('clickedLinks');
    return saved ? JSON.parse(saved) : {};
  });
  const [removedStories, setRemovedStories] = useState(() => {
    const saved = localStorage.getItem('removedStories');
    return saved ? JSON.parse(saved) : {};
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hnStories'],
    queryFn: fetchHNStories,
  });

  useEffect(() => {
    if (data) {
      const sorted = [...data.hits]
        .sort((a, b) => b.points - a.points)
        .filter(story => !clickedLinks[story.objectID] && !removedStories[story.objectID]);
      setSortedStories(sorted);
    }
  }, [data, clickedLinks, removedStories]);

  useEffect(() => {
    localStorage.setItem('clickedLinks', JSON.stringify(clickedLinks));
  }, [clickedLinks]);

  useEffect(() => {
    localStorage.setItem('removedStories', JSON.stringify(removedStories));
  }, [removedStories]);

  const handleLinkClick = (objectID) => {
    setClickedLinks(prev => ({ ...prev, [objectID]: true }));
    setSortedStories(prev => prev.filter(story => story.objectID !== objectID));
  };

  const handleRemoveStory = (storyId) => {
    setRemovedStories(prev => ({ ...prev, [storyId]: true }));
    setSortedStories(prev => prev.filter(story => story.objectID !== storyId));
  };

  const filteredStories = sortedStories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          autofocus
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => (
            <Card key={story.objectID} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => handleRemoveStory(story.objectID)}
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
                      onClick={() => handleLinkClick(story.objectID)}
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
      )}
    </div>
  );
};

export default HackerNews;