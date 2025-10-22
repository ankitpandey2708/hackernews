import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="empty-state max-w-lg">
        <div className="text-center">
          <h1 className="text-[clamp(4rem,10vw,6rem)] font-bold text-muted-foreground/30 mb-4 leading-none">
            404
          </h1>
          <h2 className="empty-state-title mb-3">Page Not Found</h2>
          <p className="empty-state-description mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/">
            <Button size="lg" className="touch-target">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;