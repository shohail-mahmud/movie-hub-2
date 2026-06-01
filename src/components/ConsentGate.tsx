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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/85 backdrop-blur-sm px-3 py-4 sm:px-4 sm:py-6">
      <div className="relative my-auto flex w-full max-w-md flex-col items-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-6 text-center shadow-2xl shadow-black sm:px-8 sm:py-10">
        {/* Logo */}
        <div className="mb-4 flex items-center text-2xl font-black tracking-tight sm:mb-6 sm:text-4xl">
          <span className="text-white">Movie</span>
          <span className="ml-1 rounded-sm bg-[#f97316] px-2 py-0.5 text-black">Hub</span>
        </div>

        {/* Heading */}
        <h1 className="text-xl font-extrabold text-white sm:text-3xl">
          Important Notice
        </h1>

        {/* Notice to Users pill */}
        <div className="mt-3 sm:mt-5">
          <span className="inline-block rounded-md border border-[#f97316] bg-transparent px-4 py-1.5 text-xs font-semibold text-white sm:px-5 sm:py-2 sm:text-sm">
            Notice to Users
          </span>
        </div>

        {/* Body */}
        <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-neutral-300 sm:mt-6 sm:text-[15px]">
          This website uses 3rd party API for loading and streaming movies. You
          are highly recommended to use an ad blocker for better experience and
          security.
        </p>

        {/* Buttons */}
        <div className="mt-5 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3">
          <button
            onClick={accept}
            className="rounded-md border border-[#f97316] bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-orange-400 sm:px-6 sm:py-3"
          >
            I Understand and Enter
          </button>
          <button
            onClick={leave}
            className="rounded-md border border-[#f97316] bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f97316]/10 sm:px-6 sm:py-3"
          >
            Leave
          </button>
        </div>

        {/* Footer disclaimer */}
        <p className="mt-6 max-w-md text-[11px] leading-relaxed text-neutral-400 sm:mt-10 sm:text-xs">
          This UI design is inspired by other platforms. This is a fun personal
          project and we do not have any right to copy other people's work.
        </p>
      </div>
    </div>
  );
}
