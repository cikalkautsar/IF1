import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { GalleryPage } from './components/GalleryPage';
import { StudentsPage } from './components/StudentsPage';
import { MateriPage } from './components/MateriPage';
import { MessagesPage } from './components/MessagesPage';
import { supabase } from '../supabase';

type SubmissionStatus = 'approved' | 'rejected';

interface Submission {
  id: string;
  image_url: string;
  type: string;
  short_desc: string;
  description?: string | null;
  status: SubmissionStatus;
  created_at?: string;
}

function UploadModal({ open, onClose, defaultClass }: { open: boolean; onClose: () => void; defaultClass?: string | null }) {
  const [type, setType] = useState('gallery');
  const [short_desc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [submittedName, setSubmittedName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successText, setSuccessText] = useState('');

  const AVAILABLE_CLASSES = ['11C', '11D', '11I', '11K'];
  const fileAcceptByType: Record<string, string> = {
    gallery: 'image/*',
    foto: 'image/*',
    materi: 'image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt',
  };

  useEffect(() => {
    if (!open) {
      setShortDesc('');
      setDescription('');
      setSubmittedName('');
      setFile(null);
      setLoading(false);
      setMessage('');
      setIsSuccess(false);
      setSuccessText('');
      setType('gallery');
      setSelectedClass(null);
    } else {
      setSelectedClass(defaultClass ?? null);
    }
  }, [open, defaultClass]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const handleUploadSuccess = (text: string) => {
      setShortDesc('');
      setDescription('');
      setSubmittedName('');
      setFile(null);
      setMessage('');
      setSuccessText(text);
      setIsSuccess(true);

      window.dispatchEvent(
        new CustomEvent('submission-uploaded', {
          detail: { type, selectedClass },
        })
      );

      window.setTimeout(() => {
        onClose();
      }, 1400);
    };

    if (!file) {
      setMessage('Pilih file dulu.');
      return;
    }

    if (type === 'foto' && !selectedClass) {
      setMessage('Pilih kelas dulu. Kelas wajib untuk upload foto.');
      return;
    }
    if (!submittedName.trim()) {
      setMessage('Masukkan nama terlebih dahulu supaya tidak anonim.');
      return;
    }

    setLoading(true);
    setMessage('');

    const bucketName = type;
    const safeName = file.name.replace(/\s+/g, '-');
    const storagePath = `${type}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from(bucketName).upload(storagePath, file, {
      upsert: true,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
    const image_url = publicData.publicUrl;

    // Try to insert including `class`. If the DB doesn't have that column yet,
    // retry without it so the upload flow still works.
    const payloadWithClass: any = {
      image_url,
      type,
      short_desc: short_desc.trim() || file.name,
      description: description.trim() || null,
      status: 'approved',
      class: selectedClass || null,
      submitted_by: submittedName.trim(),
    };
    let { error: submissionError } = await supabase.from('submissions').insert(payloadWithClass);

    if (submissionError) {
      const msg = submissionError.message || '';
      const missingClassColumn = /Could not find the 'class' column|column "class" does not exist/i.test(msg);
      const missingSubmittedByColumn = /Could not find the 'submitted_by' column|column "submitted_by" does not exist/i.test(msg);

      if (missingClassColumn || missingSubmittedByColumn) {
        // Retry without optional fields (class and submitted_by)
        const payloadWithoutOptional = {
          image_url,
          type,
          short_desc: short_desc.trim() || file.name,
          description: description.trim() || null,
          status: 'approved',
        };

        const { error: retryError } = await supabase.from('submissions').insert(payloadWithoutOptional);
        if (retryError) {
          setMessage(`File terupload, tapi gagal simpan submission: ${retryError.message}`);
          setShortDesc('');
          setFile(null);
          return;
        }

        handleUploadSuccess('Upload berhasil! (Sebagian field belum tersimpan di DB)');
        return;
      }

      setMessage(`File terupload, tapi gagal simpan submission: ${submissionError.message}`);
      setShortDesc('');
      setFile(null);
      return;
    }

    handleUploadSuccess('File berhasil diupload dan langsung tampil!');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(26, 46, 34, 0.7)' }}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--sage-green)' }}>
              Share Your Moment
            </p>
            <h2 className="font-serif text-3xl" style={{ color: 'var(--brown)' }}>
              Upload File
            </h2>
          </div>

          <button onClick={onClose} className="text-2xl leading-none" style={{ color: 'var(--dark-green)' }}>
            ×
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--sage-green)' }}>
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-serif text-2xl mb-2" style={{ color: 'var(--brown)' }}>
              Berhasil Upload
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--dark-green)' }}>
              {successText}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
            >
              Tutup
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Type
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
            >
              <option value="gallery">Gallery</option>
              <option value="foto">Foto</option>
              <option value="materi">Materi</option>
            </select>
          </div>

          {type === 'foto' && (
            <div>
              <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
                Kelas (wajib)
              </label>
              <select
                value={selectedClass ?? ''}
                onChange={(e) => setSelectedClass(e.target.value || null)}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
                style={{ borderColor: 'var(--beige)' }}
              >
                <option value="">-- Pilih kelas --</option>
                {AVAILABLE_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Nama
            </label>
            <input
              type="text"
              value={submittedName}
              onChange={(event) => setSubmittedName(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              placeholder="Nama"
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Short Description
            </label>
            <input
              type="text"
              value={short_desc}
              onChange={(event) => setShortDesc(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              placeholder="Contoh: Graduation Day"
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              placeholder="Tulis deskripsi untuk submission ini"
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              File
            </label>
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              accept={fileAcceptByType[type] || '*/*'}
            />
          </div>

          {message && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#F5F1EB', color: 'var(--dark-green)' }}>
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 transition-all duration-300 hover:opacity-80"
              style={{ borderColor: 'var(--beige)', color: 'var(--dark-green)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSuccess}
              className="flex-1 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}


export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedClass(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <div className="min-h-screen">
      {currentPage !== 'home' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          selectedClass={selectedClass}
        />
      )}

      {currentPage === 'home' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'gallery' && <GalleryPage onUploadOpen={() => setIsUploadOpen(true)} />}
      {currentPage === 'students' && <StudentsPage onClassSelect={setSelectedClass} onUploadOpen={() => setIsUploadOpen(true)} />}
      {currentPage === 'materi' && <MateriPage onUploadOpen={() => setIsUploadOpen(true)} />}
      {currentPage === 'messages' && <MessagesPage />}

      <UploadModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} defaultClass={selectedClass} />
    </div>
  );
}