export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05070A]">
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#F85149] opacity-20 blur-[120px] animate-[float_22s_ease-in-out_infinite]" />
      <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-[#3FB950] opacity-[0.12] blur-[130px] animate-[float_26s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-[-200px] left-1/4 w-[400px] h-[400px] rounded-full bg-[#D29922] opacity-[0.08] blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}