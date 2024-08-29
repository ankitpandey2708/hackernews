import { NewspaperIcon } from "lucide-react";
import HackerNews from "./pages/HackerNews.jsx";

/**
 * Central place for defining the navigation items. Used for navigation components and routing.
 */
export const navItems = [
  {
    title: "Hacker News",
    to: "/",
    icon: <NewspaperIcon className="h-4 w-4" />,
    page: <HackerNews />,
  },
];
