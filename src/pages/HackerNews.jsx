import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subWeeks } from 'date-fns';

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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['hnStories'],
    queryFn: fetchHNStories,
  });

  useEffect(() => {
    if (data) {
      const sorted = [...data.hits]
        .sort((a, b) => b.points - a.points)
        .filter(story => !clickedLinks[story.url]);
      setSortedStories(sorted);
    }
  }, [data, clickedLinks]);

  useEffect(() => {
    localStorage.setItem('clickedLinks', JSON.stringify(clickedLinks));
  }, [clickedLinks]);

  const handleLinkClick = (url) => {
    setClickedLinks(prev => ({ ...prev, [url]: true }));
    setSortedStories(prev => prev.filter(story => story.url !== url));
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
            <Card key={story.objectID}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {story.url ? (
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${
                        clickedLinks[story.url]
                          ? 'text-gray-500 no-underline hover:no-underline'
                          : 'text-blue-500 hover:underline'
                      }`}
                      onClick={() => handleLinkClick(story.url)}
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
