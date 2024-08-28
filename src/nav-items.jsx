import { HomeIcon, NewspaperIcon } from "lucide-react";
import Index from "./pages/Index.jsx";
import HackerNews from "./pages/HackerNews.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Hacker News",
    to: "/hacker-news",
    icon: <NewspaperIcon className="h-4 w-4" />,
    page: <HackerNews />,
  },
];
