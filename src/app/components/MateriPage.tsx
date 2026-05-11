import { useEffect, useState } from 'react';
import { FadeIn } from './FadeIn';
import { supabase } from '../../supabase';

interface Material {
  id: string;
  title: string;
  teacher: string;
  description: string;
  file_url: string;
  created_at?: string;
}

interface ApprovedSubmission {
  id: string;
  image_url: string;
  short_desc: string;
  description?: string | null;
  type: string;
  status: string;
}

type PreviewKind = 'image' | 'pdf' | 'office' | 'other';

export function MateriPage({ onUploadOpen }: { onUploadOpen?: () => void }) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<ApprovedSubmission[]>([]);

  const loadData = async () => {
    // Load from materiale table
    const { data: materialsData } = await supabase
      .from('materiale')
      .select('*')
      .order('created_at', { ascending: false });

    setMaterials((materialsData || []) as Material[]);

    // Load approved submissions with type='materi'
    const { data: submissionsData } = await supabase
      .from('submissions')
      .select('*')
      .eq('type', 'materi')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    setApprovedSubmissions((submissionsData || []) as ApprovedSubmission[]);
  };

  useEffect(() => {
    loadData();

    const handleUploaded = () => {
      loadData();
    };

    window.addEventListener('submission-uploaded', handleUploaded);

    return () => {
      window.removeEventListener('submission-uploaded', handleUploaded);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus materi ini?')) return;

    const deleteQuery = supabase.from('submissions').delete().eq('id', id) as any;
    const { error } = await deleteQuery;
    if (error) {
      alert('Gagal hapus: ' + error.message);
      return;
    }

    loadData();
  };

  const getFileExtension = (fileUrl: string) => {
    if (!fileUrl) return '';
    const cleanedUrl = fileUrl.split('?')[0];
    const ext = cleanedUrl.toLowerCase().split('.').pop() || '';
    return ext;
  };

  const getPreviewKind = (fileUrl: string): PreviewKind => {
    const ext = getFileExtension(fileUrl);

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext)) return 'office';
    return 'other';
  };

  const getOfficePreviewUrl = (fileUrl: string) => {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
  };

  const renderPreview = (fileUrl: string, title: string) => {
    const kind = getPreviewKind(fileUrl);

    if (kind === 'image') {
      return (
        <img
          src={fileUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      );
    }

    if (kind === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          title={title}
          className="w-full h-full"
        />
      );
    }

    if (kind === 'office') {
      return (
        <iframe
          src={getOfficePreviewUrl(fileUrl)}
          title={title}
          className="w-full h-full"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-sm px-4 text-center" style={{ color: 'var(--dark-green)' }}>
        Preview belum tersedia untuk tipe file ini.
      </div>
    );
  };
  const getIcon = (fileUrl: string) => {
    if (!fileUrl) return null;
    const ext = fileUrl.toLowerCase().split('.').pop() || '';
    
    if (ext === 'pdf') {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" />
        </svg>
      );
    }
    if (['doc', 'docx'].includes(ext)) {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
          <path d="M14 2v6h6M9 13h6M9 17h6" />
        </svg>
      );
    }
    if (['mp4', 'webm', 'avi'].includes(ext)) {
      return (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:pt-24 sm:pb-16 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="font-serif text-3xl sm:text-5xl mb-4" style={{ color: 'var(--brown)' }}>
              Study Materials
            </h1>
            <p style={{ color: 'var(--dark-green)' }}>
              Resources from our dedicated teachers
            </p>
            {onUploadOpen && (
              <button
                onClick={onUploadOpen}
                className="mt-6 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
              >
                Masukkan Materi
              </button>
            )}
          </div>
        </FadeIn>

        {materials.length > 0 && (
          <div className="mb-14">
            <h2 className="font-serif text-3xl mb-6" style={{ color: 'var(--brown)' }}>
              Materials dari Guru
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((material, index) => (
                <FadeIn key={material.id} delay={index * 100}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="w-full aspect-video mb-4 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--beige)' }}>
                      {renderPreview(material.file_url, material.title)}
                    </div>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
                      >
                        {getIcon(material.file_url)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--brown)' }}>
                          {material.title}
                        </h3>
                        <p className="text-sm mb-3" style={{ color: 'var(--sage-green)' }}>
                          By {material.teacher}
                        </p>
                        <p className="text-sm mb-4" style={{ color: 'var(--dark-green)' }}>
                          {material.description}
                        </p>
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: 'var(--sage-green)',
                            color: 'white',
                          }}
                        >
                          Buka
                        </a>
                        <a
                          href={material.file_url}
                          download
                          className="inline-block mt-2 ml-0 sm:mt-0 sm:ml-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: 'var(--dark-green)',
                            color: 'white',
                          }}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        )}

        {approvedSubmissions.length > 0 && (
          <div className="mt-14">
            <h2 className="font-serif text-3xl mb-6" style={{ color: 'var(--brown)' }}>
              Approved Uploads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedSubmissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative overflow-hidden aspect-video mb-3 rounded-xl border" style={{ borderColor: 'var(--beige)' }}>
                    {renderPreview(submission.image_url, submission.short_desc)}
                  </div>
                  <h3 className="font-serif text-xl mb-2" style={{ color: 'var(--brown)' }}>
                    {submission.short_desc}
                  </h3>
                  {submission.description && (
                    <p className="text-sm mb-4" style={{ color: 'var(--dark-green)' }}>
                      {submission.description}
                    </p>
                  )}
                  <a
                    href={submission.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--sage-green)',
                      color: 'white',
                    }}
                  >
                    Buka
                  </a>
                  <a
                    href={submission.image_url}
                    download
                    className="inline-block mt-2 ml-0 sm:mt-0 sm:ml-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: 'var(--dark-green)',
                      color: 'white',
                    }}
                  >
                    Download
                  </a>
                  <button
                    onClick={() => handleDelete(submission.id)}
                    className="mt-2 ml-0 sm:mt-0 sm:ml-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: '#8B3A2B',
                      color: 'white',
                    }}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
