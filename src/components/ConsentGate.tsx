import { useEffect, useState } from "react";

const CONSENT_KEY = "mh.consent.v1";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black px-4 py-10">
      {/* dramatic glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(249,115,22,0.18), transparent 55%), radial-gradient(ellipse at bottom, rgba(245,158,11,0.10), transparent 60%)",
        }}
      />

      <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-10 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#f97316] to-amber-500 px-7 py-4 shadow-[0_0_60px_-10px_rgba(249,115,22,0.7)]">
          <span className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-white">
            MOVIES
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          Important Notice
        </h1>
        <div className="mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#f97316] to-amber-400" />

        {/* Notice box */}
        <div className="mt-8 w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-6 sm:p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur">
          <p className="text-base sm:text-lg leading-relaxed text-neutral-200">
            This website uses{" "}
            <span className="font-semibold text-[#f97316]">3rd party API</span>{" "}
            for loading and streaming movies. You are highly recommended to use
            an <span className="font-semibold text-[#f97316]">ad blocker</span>{" "}
            for better experience and security.
          </p>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 max-w-xl text-xs sm:text-sm leading-relaxed text-neutral-400">
          This UI design is inspired by other platforms. This is a fun personal
          project and we do not have any right to copy other people's work.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={leave}
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-8 py-4 text-base font-semibold uppercase tracking-wider text-neutral-200 transition hover:bg-neutral-800 sm:min-w-[200px]"
          >
            Leave
          </button>
          <button
            onClick={accept}
            className="rounded-lg bg-[#f97316] px-8 py-4 text-base font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(249,115,22,0.55)] transition hover:bg-orange-400 hover:shadow-[0_0_45px_rgba(249,115,22,0.8)] sm:min-w-[260px]"
          >
            I Understand and Enter
          </button>
        </div>
      </div>
    </div>
  );
}
