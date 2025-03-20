
import React from 'react';
import { Github } from 'lucide-react';

const GitHubBadge = ({ repoUrl = "https://github.com/yourusername/mini-hn" }) => {
  return (
    <a 
      href={repoUrl}
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
