import { useEffect, useState } from 'react';
import { FadeIn } from './FadeIn';
import { supabase } from '../../supabase';

interface ApprovedSubmission {
  id: string;
  image_url: string;
  short_desc: string;
  description?: string | null;
  type: string;
  status: string;
}

interface GalleryPageProps {
  onUploadOpen?: () => void;
}

export function GalleryPage({ onUploadOpen }: GalleryPageProps) {
  const [selectedItem, setSelectedItem] = useState<ApprovedSubmission | null>(null);
  const [approvedSubmissions, setApprovedSubmissions] = useState<ApprovedSubmission[]>([]);

  const loadApprovedSubmissions = async () => {
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('type', 'gallery')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    setApprovedSubmissions((data || []) as ApprovedSubmission[]);
  };

  useEffect(() => {
    loadApprovedSubmissions();

    const handleUploaded = () => {
      loadApprovedSubmissions();
    };

    window.addEventListener('submission-uploaded', handleUploaded);

    return () => {
      window.removeEventListener('submission-uploaded', handleUploaded);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus gambar ini?')) return;

    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (error) {
      alert('Gagal hapus: ' + error.message);
      return;
    }

    setSelectedItem(null);
    loadApprovedSubmissions();
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" style={{ backgroundColor: '#F5F1EB' }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="font-serif text-6xl mb-3" style={{ color: 'var(--brown)' }}>
              Our Gallery
            </h1>
            {onUploadOpen && (
              <button
                onClick={onUploadOpen}
                className="mt-6 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
              >
                Upload to Gallery
              </button>
            )}
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-1 rounded" style={{ backgroundColor: 'var(--sage-green)' }}></div>
              <svg className="w-6 h-6" style={{ color: 'var(--sage-green)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 22L12 18.5L5.5 22L7 14.5L2 9.5L9 8.5L12 2Z"/>
              </svg>
              <div className="w-12 h-1 rounded" style={{ backgroundColor: 'var(--sage-green)' }}></div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approvedSubmissions.map((submission) => (
            <FadeIn key={submission.id}>
              <div
                className="cursor-pointer"
                onClick={() => setSelectedItem(submission)}
              >
                <div className="group relative p-4 bg-white rounded-sm shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 opacity-60" style={{
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, var(--beige) 2px, var(--beige) 4px)',
                  }}>
                    <div className="w-full h-full" style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)',
                    }}></div>
                  </div>

                  <div className="relative overflow-hidden aspect-square mb-3">
                    <img
                      src={submission.image_url}
                      alt={submission.short_desc}
                      className="w-full h-full object-cover border-4 border-white shadow-inner"
                      loading="lazy"
                    />
                  </div>

                  <div className="relative">
                    <p
                      className="text-center text-lg italic mb-1"
                      style={{
                        color: 'var(--brown)',
                        fontFamily: "'Brush Script MT', cursive"
                      }}
                    >
                      {submission.short_desc}
                    </p>

                    <div className="flex justify-center gap-1 mt-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--sage-green)' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--beige)' }}></div>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--sage-green)' }}></div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(submission.id);
                      }}
                      className="w-full py-2 text-sm rounded-lg transition-all hover:opacity-80"
                      style={{ backgroundColor: '#8B3A2B', color: 'white' }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={800}>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white rounded-full shadow-lg" style={{
              transform: 'rotate(-1deg)',
            }}>
              <svg className="w-5 h-5" style={{ color: 'var(--sage-green)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <span className="italic" style={{ color: 'var(--brown)' }}>
                Each moment is a treasure ~
              </span>
              <svg className="w-5 h-5" style={{ color: 'var(--sage-green)' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
        </FadeIn>
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(58, 90, 64, 0.85)' }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-lg max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative"
            style={{
              border: '8px solid white',
              boxShadow: '0 0 0 1px var(--beige), 0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 opacity-80" style={{
              background: 'repeating-linear-gradient(90deg, transparent, transparent 3px, var(--beige) 3px, var(--beige) 6px)',
            }}>
              <div className="w-full h-full" style={{
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 100%)',
              }}></div>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg z-10 border-2"
              style={{ backgroundColor: 'white', color: 'var(--dark-green)', borderColor: 'var(--dark-green)' }}
              title="Tutup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium">Close</span>
            </button>

            <div className="p-8">
              <div className="w-full border-4 border-white shadow-lg mb-6 rounded-lg overflow-hidden" style={{ backgroundColor: '#f7f4ef' }}>
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.short_desc}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>

              <div className="text-center mb-4">
                <h2 className="font-serif text-4xl mb-6" style={{ color: 'var(--brown)' }}>
                  {selectedItem.short_desc}
                </h2>

                <div className="flex justify-center gap-2 mb-6">
                  <div className="w-16 h-1 rounded" style={{ backgroundColor: 'var(--sage-green)' }}></div>
                  <div className="w-2 h-2 rounded-full self-center" style={{ backgroundColor: 'var(--beige)' }}></div>
                  <div className="w-16 h-1 rounded" style={{ backgroundColor: 'var(--sage-green)' }}></div>
                </div>
              </div>

              {selectedItem.description && (
                <p className="text-lg leading-relaxed text-center italic px-8" style={{ color: 'var(--dark-green)' }}>
                  "{selectedItem.description}"
                </p>
              )}

              <div className="flex justify-center mt-6">
                <a
                  href={selectedItem.image_url}
                  download
                  className="px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
                >
                  Download Foto
                </a>
              </div>

              <div className="flex justify-center gap-2 mt-8">
                <svg className="w-5 h-5" style={{ color: 'var(--sage-green)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <svg className="w-5 h-5" style={{ color: 'var(--sage-green)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 22L12 18.5L5.5 22L7 14.5L2 9.5L9 8.5L12 2Z"/>
                </svg>
                <svg className="w-5 h-5" style={{ color: 'var(--sage-green)' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
