import { subWeeks } from 'date-fns';

const BASE_URL = 'https://hn.algolia.com/api/v1';

export const fetchHNStories = async () => {
  const oneWeekAgo = Math.floor(subWeeks(new Date(), 1).getTime() / 1000);
  const response = await fetch(
    `${BASE_URL}/search?tags=story&numericFilters=created_at_i>${oneWeekAgo},points>=10&hitsPerPage=1000`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch Hacker News stories');
  }
  
  return response.json();
};

export const getStoryUrl = (objectID) => `https://news.ycombinator.com/item?id=${objectID}`; 