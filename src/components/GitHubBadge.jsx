
import React from 'react';
import { Github } from 'lucide-react';

const GitHubBadge = () => {
  return (
    <a 
      href="https://github.com/ankitpandey2708/hackernews"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-4 right-4 z-50 bg-black hover:bg-gray-800 text-white p-3 rounded-full shadow-md transition-colors"
      aria-label="View source on GitHub"
    >
      <Github size={24} />
    </a>
  );
};

export default GitHubBadge;
