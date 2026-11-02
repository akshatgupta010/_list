import bgImage from '@/assets/art/futuristic-bg.jpg';

export function ArtBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Background artwork with subtle vignette mask */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-15 transition-opacity duration-500 filter contrast-125 saturate-50"
        style={{
          backgroundImage: `url(${bgImage})`,
          maskImage:
            'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 70%, black 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 70%, black 100%)',
        }}
      />

      {/* Decorative vertical hairline streak on left margin */}
      <div className="absolute top-0 bottom-0 left-6 w-[1px] bg-gradient-to-b from-transparent via-line/60 to-transparent hidden lg:block" />

      {/* Decorative vertical hairline streak on right margin */}
      <div className="absolute top-0 bottom-0 right-6 w-[1px] bg-gradient-to-b from-transparent via-line/60 to-transparent hidden lg:block" />
    </div>
  );
}
