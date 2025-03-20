
import React from 'react';
import { Github } from 'lucide-react';

const GitHubBadge = ({ repoUrl = "https://github.com/yourusername/mini-hn" }) => {
  return (
    <a 
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 right-0 z-50 w-40 h-40 overflow-hidden"
      aria-label="View source on GitHub"
    >
      <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 rotate-45 bg-black text-white shadow-md flex items-center justify-center w-56 h-14 pt-8 hover:bg-gray-800 transition-colors">
        <Github className="mr-2" size={18} />
        <span className="text-sm font-semibold">GitHub</span>
      </div>
    </a>
  );
};

export default GitHubBadge;
