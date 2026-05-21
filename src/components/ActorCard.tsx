import { Actor, profileUrl } from "../api/tmdb";

interface ActorCardProps {
  actor: Actor;
  onClick: (actor: Actor) => void;
}

export default function ActorCard({ actor, onClick }: ActorCardProps) {
  return (
    <button
      onClick={() => onClick(actor)}
      className="group flex flex-col items-center text-center focus:outline-none"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-neutral-700 transition duration-300 group-hover:border-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/20">
        <img
          src={profileUrl(actor.profile_path, "w185")}
          alt={actor.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition group-hover:bg-black/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            className="h-8 w-8 opacity-0 transition group-hover:opacity-100"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <p className="mt-2.5 text-sm font-semibold text-white transition group-hover:text-amber-400 leading-tight line-clamp-1">
        {actor.name}
      </p>
      <p className="mt-0.5 text-xs text-neutral-500">
        {actor.known_for_department}
      </p>
    </button>
  );
}
