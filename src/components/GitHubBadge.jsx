
import React from 'react';
import { Github } from 'lucide-react';

const GitHubBadge = ({ repoUrl = "https://github.com/yourusername/mini-hn" }) => {
  return (
    <a 
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 right-0 z-50 w-32 h-32 overflow-hidden"
      aria-label="View source on GitHub"
    >
      <div className="absolute top-0 right-0 transform rotate-45 bg-black text-white shadow-md flex items-center justify-center w-48 h-12 -mt-2 -mr-20 hover:bg-gray-800 transition-colors">
        <Github className="mr-2" size={18} />
        <span className="text-sm font-semibold">GitHub</span>
      </div>
    </a>
  );
};

export default GitHubBadge;
