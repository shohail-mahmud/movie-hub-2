import { useEffect, useState } from "react";

const CONSENT_KEY = "mh.consent.v2";

export default function ConsentGate() {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setAccepted(localStorage.getItem(CONSENT_KEY) === "1");
    } catch {
      setAccepted(true);
    }
  }, []);

  if (accepted === null || accepted) return null;

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "1");
    } catch {}
    setAccepted(true);
  };

  const leave = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 backdrop-blur-sm px-4 py-6">
      <div className="relative flex w-full max-w-md flex-col items-center rounded-xl border border-neutral-800 bg-neutral-950 px-6 py-8 text-center shadow-2xl shadow-black sm:px-8 sm:py-10">
        {/* Logo */}
        <div className="mb-8 flex items-center text-3xl sm:text-4xl font-black tracking-tight">
          <span className="text-white">Movie</span>
          <span className="ml-1 rounded-sm bg-[#f97316] px-2 py-0.5 text-black">Hub</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Important Notice
        </h1>

        {/* Notice to Users pill */}
        <div className="mt-6">
          <span className="inline-block rounded-md border border-[#f97316] bg-transparent px-5 py-2 text-sm font-semibold text-white">
            Notice to Users
          </span>
        </div>

        {/* Body */}
        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-neutral-300">
          This website uses 3rd party API for loading and streaming movies. You
          are highly recommended to use an ad blocker for better experience and
          security.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={accept}
            className="rounded-md border border-[#f97316] bg-[#f97316] px-6 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
          >
            I Understand and Enter
          </button>
          <button
            onClick={leave}
            className="rounded-md border border-[#f97316] bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#f97316]/10"
          >
            Leave
          </button>
        </div>

        {/* Footer disclaimer */}
        <p className="mt-10 max-w-md text-xs leading-relaxed text-neutral-400">
          This UI design is inspired by other platforms. This is a fun personal
          project and we do not have any right to copy other people's work.
        </p>
      </div>
    </div>
  );
}
