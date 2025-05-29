import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} README Generator. All rights reserved (or specify your license).</p>
        <p className="text-sm mt-1">
          Built with React, TypeScript, Tailwind CSS, and OpenRouter API.
        </p>
      </div>
    </footer>
  );
};

export default Footer;