import { FadeIn } from './FadeIn';
import kolaseKelas from '../../images/kolase kelas.png';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <div
        className="relative h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0f0f0f' }}
      >
        <img
          src={kolaseKelas}
          alt="Kolase kelas"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 1, filter: 'saturate(1.08) contrast(1.02) brightness(1)' }}
        />

        <div className="relative z-10 w-full max-w-5xl px-6">
          <div
            className="mx-auto rounded-[2rem] border border-white/25 bg-white/16 px-6 py-10 shadow-2xl md:px-12 md:py-14"
            style={{
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
            }}
          >
            <FadeIn>
              <h1
                className="font-serif text-5xl md:text-7xl mb-6 leading-tight"
                style={{ color: '#FFFFFF', textShadow: '0 2px 16px rgba(0, 0, 0, 0.35)' }}
              >
                IF 1 MEMORIES - CLASS OF 2026
              </h1>

              <p
                className="text-lg md:text-2xl mb-12 max-w-2xl mx-auto"
                style={{ color: 'rgba(255, 255, 255, 0.92)', textShadow: '0 2px 12px rgba(0, 0, 0, 0.28)' }}
              >
                Capturing, celebrating and cherishing moments
              </p>

              <button
                onClick={() => onNavigate('gallery')}
                className="px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#1f2937',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.16)',
                }}
              >
                Explore Memories
              </button>
            </FadeIn>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="#F5F1EB"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}