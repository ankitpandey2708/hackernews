
import React from 'react';
import { Github } from 'lucide-react';

const GitHubBadge = ({ repoUrl = "https://github.com/yourusername/mini-hn" }) => {
  return (
    <a 
      href={repoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 right-0 z-50"
      aria-label="View source on GitHub"
    >
      <div className="origin-top-right absolute top-0 right-0 transform rotate-45 translate-x-[40px] -translate-y-[20px] bg-black text-white shadow-md flex items-center justify-center w-64 h-16 hover:bg-gray-800 transition-colors">
        <div className="flex items-center justify-center translate-y-[28px]">
          <Github className="mr-2" size={18} />
          <span className="text-sm font-semibold">GitHub</span>
        </div>
      </div>
    </a>
  );
};

export default GitHubBadge;
