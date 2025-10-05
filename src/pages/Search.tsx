import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Search = () => {
  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6 hidden md:block">Search</h1>
      <div className="w-full max-w-md mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 w-full rounded-lg"
            aria-label="Search input"
          />
        </div>
      </div>
      <div className="text-muted-foreground text-center">
        <p>Search for users, posts, or tags.</p>
        <p className="mt-2">No recent searches.</p>
      </div>
    </div>
  );
};

export default Search;