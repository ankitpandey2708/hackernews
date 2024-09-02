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
  const [removedStories, setRemovedStories] = useState([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['hackerNewsStories'],
    queryFn: fetchHNStories,
  });

  useEffect(() => {
    const storedRemovedStories = localStorage.getItem('removedStories');
    if (storedRemovedStories) {
      try {
        const parsedStories = JSON.parse(storedRemovedStories);
        setRemovedStories(Array.isArray(parsedStories) ? parsedStories : []);
      } catch (e) {
        console.error('Error parsing removedStories from localStorage:', e);
        setRemovedStories([]);
      }
    }
  }, []);

  const handleRemoveStory = (storyId) => {
    const updatedRemovedStories = [...removedStories, storyId];
    setRemovedStories(updatedRemovedStories);
    localStorage.setItem('removedStories', JSON.stringify(updatedRemovedStories));
  };

  const filteredStories = data?.hits.filter(story => 
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !removedStories.includes(story.objectID)
  ) || [];

  if (isLoading) return <div className="p-4"><Skeleton className="w-full h-12" /></div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Hacker News Top Stories</h1>
      <Input
        type="text"
        placeholder="Search stories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {filteredStories.map((story) => (
        <Card key={story.objectID} className="mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              <a href={story.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {story.title}
              </a>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveStory(story.objectID)}
              className="text-red-500 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              {story.points} points | by {story.author} | {format(new Date(story.created_at), 'PPp')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HackerNews;