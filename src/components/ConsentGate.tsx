import { useEffect, useState } from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-4 py-8 overflow-y-auto">
      {/* dramatic background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(251,146,60,0.18), transparent 55%), radial-gradient(ellipse at bottom, rgba(234,88,12,0.12), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #f97316 0 1px, transparent 1px 14px)",
        }}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border-2 border-orange-500/40 bg-black/90 p-6 sm:p-10 shadow-[0_0_80px_-10px_rgba(249,115,22,0.5)] backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-orange-500 bg-orange-500/10 shadow-[0_0_40px_rgba(249,115,22,0.5)]">
            <ShieldAlert className="h-8 w-8 text-orange-400" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Notice <span className="text-orange-500">to Users</span>
          </h1>

          <div className="mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-orange-600 to-orange-400" />

          <p className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-gray-200">
            This website uses{" "}
            <span className="font-semibold text-orange-400">3rd party API</span>{" "}
            for loading and streaming movies. You are highly recommended to use
            an <span className="font-semibold text-orange-400">ad blocker</span>{" "}
            for better experience and security.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-md border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-xs sm:text-sm text-orange-300">
            <AlertTriangle className="h-4 w-4" />
            By entering, you accept the streaming risks of 3rd party providers.
          </div>

          <div className="mt-10 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={leave}
              className="rounded-md border-2 border-white/20 bg-transparent px-6 py-4 text-base font-semibold uppercase tracking-wider text-white transition hover:border-white/60 hover:bg-white/5 sm:px-10"
            >
              Leave
            </button>
            <button
              onClick={accept}
              className="rounded-md border-2 border-orange-500 bg-orange-500 px-6 py-4 text-base font-bold uppercase tracking-wider text-black shadow-[0_0_30px_rgba(249,115,22,0.6)] transition hover:bg-orange-400 hover:shadow-[0_0_45px_rgba(249,115,22,0.8)] sm:px-10"
            >
              I Understand and Enter
            </button>
          </div>

          <p className="mt-10 max-w-lg text-[11px] sm:text-xs leading-relaxed text-gray-500">
            This UI design is inspired by other platforms. This is a fun
            personal project and we do not have any right to copy other
            people's work.
          </p>
        </div>
      </div>
    </div>
  );
}
