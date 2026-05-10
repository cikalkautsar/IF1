import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
}

type UploadTarget = 'gallery' | 'foto' | 'materi';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export function UploadModal({ open, onClose }: UploadModalProps) {
  const [target, setTarget] = useState<UploadTarget>('gallery');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setFile(null);
      setLoading(false);
      setMessage('');
      setTarget('gallery');
      setUploadStatus('idle');
    }
  }, [open]);

  if (!open) {
    return null;
  }

  // Tampilkan status error saat upload gagal
  if (uploadStatus === 'error') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(26, 46, 34, 0.7)' }}>
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl text-center">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setUploadStatus('idle');
                setMessage('');
              }}
              className="text-2xl leading-none"
              style={{ color: 'var(--dark-green)' }}
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: '#FBEAE5' }}>
              <svg
                className="w-12 h-12"
                style={{ color: '#8B3A2B' }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
          </div>

          <h2 className="font-serif text-3xl mb-3" style={{ color: '#8B3A2B' }}>
            Failed upload
          </h2>

          {message && (
            <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ backgroundColor: '#FBEAE5', color: '#8B3A2B' }}>
              {message}
            </div>
          )}

          <button
            onClick={() => {
              setUploadStatus('idle');
              setMessage('');
            }}
            className="w-full py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Tampilkan status pending saat upload berhasil
  if (uploadStatus === 'success') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(26, 46, 34, 0.7)' }}>
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl text-center">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setUploadStatus('idle');
                onClose();
              }}
              className="text-2xl leading-none"
              style={{ color: 'var(--dark-green)' }}
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            {/* Loading Clock Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{ backgroundColor: '#F5F1EB' }}>
              <svg
                className="w-12 h-12 animate-spin"
                style={{ color: 'var(--sage-green)' }}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>

          <h2 className="font-serif text-3xl mb-3" style={{ color: 'var(--brown)' }}>
            Successful!
          </h2>
          <p className="mb-6" style={{ color: 'var(--dark-green)' }}>
            File uploaded!
          </p>

          {message && (
            <div className="rounded-xl px-4 py-3 text-sm mb-6" style={{ backgroundColor: '#F5F1EB', color: 'var(--dark-green)' }}>
              {message}
            </div>
          )}

          <button
            onClick={() => {
              setUploadStatus('idle');
              onClose();
            }}
            className="w-full py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage('Pilih file dulu.');
      return;
    }

    if (!title.trim()) {
      setMessage('Judul tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setMessage('');
    setUploadStatus('uploading');

    const bucketName = target;
    const safeName = file.name.replace(/\s+/g, '-');
    const storagePath = `${target}/${Date.now()}-${safeName}`;

    try {
      // Upload file ke storage
      const { error: uploadError, data: uploadData } = await supabase.storage.from(bucketName).upload(storagePath, file, {
        upsert: true,
      });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload success:', uploadData);

      // Dapatkan public URL
      const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
      const fileUrl = data.publicUrl;

      console.log('File URL:', fileUrl);

      // Insert ke submissions table dengan status approved (langsung tampil)
      const { error: insertError, data: insertData } = await supabase.from('submissions').insert([
        {
          image_url: fileUrl,
          type: target,
          short_desc: title,
          description: description || null,
          status: 'approved',
        },
      ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      console.log('Insert success:', insertData);

      setUploadStatus('success');
      setMessage('File berhasil diupload dan langsung tampil!');
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (error: any) {
      console.error('Full error:', error);
      setUploadStatus('error');
      setMessage(error.message || 'Terjadi kesalahan saat upload. Cek console untuk detail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(26, 46, 34, 0.7)' }}>
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: 'var(--sage-green)' }}>
              Open Share
            </p>
            <h2 className="font-serif text-3xl" style={{ color: 'var(--brown)' }}>
              Upload File
            </h2>
          </div>

          <button onClick={onClose} className="text-2xl leading-none" style={{ color: 'var(--dark-green)' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Target
            </label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as UploadTarget)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
            >
              <option value="gallery">Gallery</option>
              <option value="foto">Foto</option>
              <option value="materi">Materi</option>
            </select>
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              placeholder="ex: Graduation Day"
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              placeholder="write a short desc"
            />
          </div>

          <div>
            <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
              File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
              style={{ borderColor: 'var(--beige)' }}
              accept="image/*,application/pdf"
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
              disabled={loading}
              className="flex-1 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}