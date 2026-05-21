import { useState } from "react";

const topNav = ["Home", "Movies", "Series", "Live", "Categories", "Channels", "Stars", "Community"];

interface HeaderProps {
  onSearch: (query: string) => void;
  onNav: (page: string) => void;
  activePage: string;
}

export default function Header({ onSearch, onNav, activePage }: HeaderProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-neutral-800 bg-black text-xs text-neutral-400 md:block">
        <div className="mx-auto flex h-8 max-w-[1400px] items-center justify-between px-4">
          <span>MoveHub — Stream Movies in HD &amp; 4K</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Upload</a>
            <a href="#" className="hover:text-white transition">Language: EN</a>
            <a href="#" className="hover:text-white transition">Help</a>
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-800 bg-black">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4">
          <button
            onClick={() => onNav("home")}
            className="flex items-center text-2xl font-black tracking-tight shrink-0"
          >
            <span className="text-white">Move</span>
            <span className="ml-1 rounded-sm bg-amber-500 px-2 py-0.5 text-black">Hub</span>
          </button>

          <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl items-stretch overflow-hidden rounded-sm">
            <select className="border-r border-neutral-700 bg-neutral-800 px-3 text-sm text-neutral-300 focus:outline-none hidden sm:block">
              <option>Movies</option>
              <option>Stars</option>
              <option>Series</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, actors, genres..."
              className="flex-1 bg-neutral-800 px-4 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
            <button type="submit" className="bg-amber-500 px-5 text-black transition hover:bg-amber-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button className="hidden border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-amber-500 hover:text-amber-400 sm:block">
              Upload
            </button>
            <button className="bg-amber-500 px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-amber-400">
              Sign In
            </button>
            <button className="border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 transition hover:border-amber-500">
              Join
            </button>
          </div>
        </div>

        <nav className="border-t border-neutral-800 bg-neutral-900">
          <div className="mx-auto flex max-w-[1400px] items-center overflow-x-auto px-4">
            {topNav.map((item) => (
              <button
                key={item}
                onClick={() => onNav(item.toLowerCase())}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition border-b-2 ${
                  activePage === item.toLowerCase()
                    ? "border-amber-500 text-white"
                    : "border-transparent text-neutral-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
