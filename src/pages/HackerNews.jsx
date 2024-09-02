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

// ... rest of the component code ...

export default HackerNews;