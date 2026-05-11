import { useState, useEffect } from 'react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  selectedClass?: string | null;
}

export function Navbar({ currentPage, onNavigate, selectedClass }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  const isDarkPage = currentPage === 'students' && selectedClass !== null;
  const textColor = isDarkPage ? '#ffffff' : (currentPage === 'students' ? '#2D4A3E' : 'var(--brown)');
  const linkColor = isDarkPage ? '#ffffff' : (currentPage === 'students' ? '#2D4A3E' : 'var(--dark-green)');
  const activeLinkColor = isDarkPage ? '#ffffff' : (currentPage === 'students' ? '#2D4A3E' : 'var(--brown)');
  const bgClass = isDarkPage ? 'bg-black/60 backdrop-blur-md shadow-md' : (scrolled && currentPage === 'students' ? 'bg-white/95 backdrop-blur-sm shadow-md' : (scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'));

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'students', label: 'Students' },
    { id: 'materi', label: 'Materi' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgClass}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              onNavigate('home');
              setMobileMenuOpen(false);
            }}
            className="font-serif text-xl sm:text-2xl transition-colors duration-300"
            style={{ color: textColor }}
          >
            IF1 MEMORIES
          </button>

          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`transition-all duration-300 hover:opacity-70 ${
                  currentPage === item.id ? 'font-medium' : ''
                }`}
                style={{
                  color: currentPage === item.id ? activeLinkColor : linkColor,
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            className="md:hidden transition-colors duration-300"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            style={{ color: textColor }}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 rounded-xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.25)', backgroundColor: isDarkPage ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.92)' }}>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left transition-all duration-300"
                  style={{
                    color: currentPage === item.id ? activeLinkColor : linkColor,
                    backgroundColor: currentPage === item.id ? 'rgba(45,74,62,0.12)' : 'transparent',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
