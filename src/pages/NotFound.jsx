import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center animate-fade-up">
        {/* Large editorial-style 404 */}
        <h1 className="font-display text-[clamp(8rem,20vw,14rem)] font-normal italic text-muted-foreground/10 leading-none select-none mb-[-2rem]">
          404
        </h1>

        {/* Content */}
        <div className="relative z-10">
          <p className="mono-label mb-4">Page Not Found</p>

          <h2 className="font-display text-3xl sm:text-4xl italic text-foreground mb-4">
            Lost in the void
          </h2>

          <p className="text-muted-foreground max-w-md mx-auto mb-10 text-[15px] leading-relaxed">
            The page you're looking for has drifted into the digital ether.
            Perhaps it never existed, or maybe it's just hiding.
          </p>

          <Link to="/">
            <Button size="lg" className="touch-target gap-2">
              <ArrowLeft className="w-4 h-4" />
              Return to Stories
            </Button>
          </Link>
        </div>

        {/* Decorative line */}
        <div className="mt-16 w-24 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
      </div>
    </div>
  );
};

export default NotFound;
