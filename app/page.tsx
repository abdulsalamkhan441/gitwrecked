"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AmbientBackground from "@/app/components/AmbientBackground";
import GlassPanel from "@/app/components/GlassPanel";

const USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;

const Leaderboard = dynamic(() => import("@/app/components/Leaderboard"), {
  ssr: false,
});
const HallOfShame = dynamic(() => import("@/app/components/HallOfShame"), {
  ssr: false,
});

export default function Home() {
  const [username, setUsername] = useState("");
  const [touched, setTouched] = useState(false);
  const [intensity, setIntensity] = useState<"mild" | "deep-fried">("mild");
  const router = useRouter();

  const trimmed = username.trim();
  const isValid = trimmed.length > 0 && USERNAME_RE.test(trimmed);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isValid) {
      router.push(`/roast/${encodeURIComponent(trimmed)}?mode=${intensity}`);
    }
  };

  return (
    <div className="min-h-screen text-[#E6E8EB] flex flex-col">
      <AmbientBackground />
      <nav className="px-6 py-5 flex items-center justify-between">
        <a href="#" className="">
          <Image
            src="/logogitwrecked.png"
            alt="GitWrecked Logo"
            width={120}
            height={120}
            priority
            className="w-auto object-contain"
          />
        </a>
        <a
          href="#leaderboard"
          className="text-[#6E7681] hover:text-[#E6E8EB] transition-colors font-mono text-sm"
        >
          leaderboard ↓
        </a>
      </nav>
      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <GlassPanel className="w-full max-w-lg p-8">
          <p className="font-mono text-[#6E7681] text-sm mb-2">
            $ whoami --brutally-honest
          </p>
          <h1 className="font-mono text-3xl font-bold leading-tight mb-3">
            Your GitHub, <span className="text-[#F85149]">peer reviewed</span>
          </h1>
          <p className="text-[#E6E8EB]/70 text-sm mb-8">
            Public repos, dead projects, and questionable follow ratios — turned
            into a review nobody requested.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label className="block font-mono text-[#6E7681] text-xs mb-2">
              username
            </label>
            <div className="flex items-center rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 focus-within:border-[#F85149] transition-colors">
              <span className="font-mono text-[#3FB950] mr-2 select-none">
                $
              </span>
              <input
                type="text"
                placeholder="octocat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched(true)}
                className="flex-1 bg-transparent outline-none font-mono text-[#E6E8EB] placeholder-[#6E7681]"
                autoComplete="off"
              />
            </div>
            {touched && !isValid && trimmed.length > 0 && (
              <p className="text-[#F85149] text-xs mt-2 font-mono">
                not a valid GitHub username
              </p>
            )}

            <div className="mt-5">
              <p className="font-mono text-[#6E7681] text-xs mb-2">intensity</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIntensity("mild")}
                  className={`rounded-lg border px-3 py-2.5 font-mono text-sm transition-colors ${
                    intensity === "mild"
                      ? "border-[#3FB950] bg-[#3FB950]/10 text-[#3FB950]"
                      : "border-white/10 text-[#6E7681] hover:text-[#E6E8EB]"
                  }`}
                >
                  mild
                </button>
                <button
                  type="button"
                  onClick={() => setIntensity("deep-fried")}
                  className={`rounded-lg border px-3 py-2.5 font-mono text-sm transition-colors ${
                    intensity === "deep-fried"
                      ? "border-[#F85149] bg-[#F85149]/10 text-[#F85149]"
                      : "border-white/10 text-[#6E7681] hover:text-[#E6E8EB]"
                  }`}
                >
                  deep fried 🔥
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="mt-6 w-full rounded-lg bg-[#F85149] text-[#0B0E14] font-mono font-bold py-2.5 hover:bg-[#ff6b63] disabled:bg-white/10 disabled:text-[#6E7681] transition-colors"
            >
              run analysis →
            </button>
          </form>
        </GlassPanel>
      </section>
      <Leaderboard />
      <HallOfShame />
      <footer className="border-t border-white/10 px-6 py-10 font-mono text-sm">
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-bold mb-1">
              git<span className="text-[#F85149]">wrecked</span>
            </p>
            <p className="text-[#6E7681] text-xs">
              reads public GitHub data only, stores nothing beyond scores
            </p>
          </div>
          <div className="flex gap-5 text-xs text-[#6E7681]">
            <a
              href="mailto:abdulsalamkhanwbd@gmail.com"
              className="hover:text-[#E6E8EB] transition-colors"
            >
              email
            </a>

            <a
              href="https://github.com/abdulsalamkhan441"
              className="hover:text-[#E6E8EB] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
            </a>

            <a
              href="https://www.linkedin.com/in/abdulsalam-khan-/"
              className="hover:text-[#E6E8EB] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              linked in
            </a>
          </div>
        </div>
        <p className="max-w-lg mx-auto mt-6 text-[10px] text-[#6E7681]/70">
          not affiliated with GitHub, Inc. · for entertainment purposes only
        </p>
      </footer>
    </div>
  );
}
