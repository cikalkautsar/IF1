import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { FadeIn } from './FadeIn';

interface Message {
  id: string;
  message: string;
  timestamp?: string;
  name?: string;
  created_at?: string;
}

const MESSAGES_TABLE = 'messages';

export function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState({ message: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; messageId: string | null }>({
    show: false,
    messageId: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      setError('');

      const { data, error: loadError } = await supabase
        .from(MESSAGES_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (loadError) {
        setError(`Gagal memuat pesan: ${loadError.message}`);
        setMessages([]);
        setLoading(false);
        return;
      }

      setMessages((data || []) as Message[]);
      setLoading(false);
    };

    loadMessages();
  }, []);

  const loadMessages = async () => {
    const { data, error: loadError } = await supabase
      .from(MESSAGES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (loadError) {
      setError(`Gagal memuat pesan: ${loadError.message}`);
      return;
    }

    setMessages((data || []) as Message[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message.trim() || !formData.name.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    const { error: insertError } = await supabase.from(MESSAGES_TABLE).insert({
      name: formData.name.trim(),
      message: formData.message.trim(),
    });

    if (insertError) {
      setError(`Gagal simpan pesan: ${insertError.message}`);
      setLoading(false);
      return;
    }

    setFormData({ message: '', name: '' });
    await loadMessages();
    setLoading(false);
  };

  const handleDeleteClick = (messageId: string) => {
    setDeleteConfirm({ show: true, messageId });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.messageId) return;

    setDeleting(true);
    const deleteQuery = supabase
      .from(MESSAGES_TABLE)
      .delete()
      .eq('id', deleteConfirm.messageId) as any;
    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      setError(`Gagal hapus pesan: ${deleteError.message}`);
      setDeleting(false);
      return;
    }

    await loadMessages();
    setDeleteConfirm({ show: false, messageId: null });
    setDeleting(false);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, messageId: null });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:pt-24 sm:pb-16 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl mb-4" style={{ color: 'var(--brown)' }}>
              Message Board
            </h1>
            <p style={{ color: 'var(--dark-green)' }}>
              Leave your message, wishes, and prayers for everyone
            </p>
          </div>
        </FadeIn>

        {error && (
          <FadeIn delay={50}>
            <div className="mb-6 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#F8E7E7', color: '#8B3A2B' }}>
              {error}
            </div>
          </FadeIn>
        )}

        <FadeIn delay={100}>
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg mb-12">
            <h2 className="font-serif text-2xl mb-6" style={{ color: 'var(--brown)' }}>
              Write Your Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
                  Your name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
                  style={{ borderColor: 'var(--beige)' }}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block mb-2" style={{ color: 'var(--dark-green)' }}>
                  Your Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:border-[var(--sage-green)] transition-colors"
                  style={{ borderColor: 'var(--beige)' }}
                  placeholder="Share your thoughts, wishes, or prayers..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 rounded-lg transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--brown)',
                  color: 'var(--cream)',
                }}
              >
                {loading ? 'Saving...' : 'Submit'}
              </button>
            </form>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {loading && messages.length === 0 && (
            <div className="text-center py-10" style={{ color: 'var(--dark-green)' }}>
              Memuat pesan...
            </div>
          )}
          {messages.map((msg, index) => (
            <FadeIn key={msg.id} delay={index * 50}>
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--sage-green)', color: 'white' }}
                  >
                    <span className="font-serif text-lg sm:text-xl">
                      {msg.name ? msg.name.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="font-serif text-base sm:text-lg" style={{ color: 'var(--brown)' }}>
                        {msg.name || 'Anonymous'}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                        {(msg.timestamp || msg.created_at) && (
                          <span className="text-xs sm:text-sm break-all" style={{ color: 'var(--sage-green)' }}>
                            {msg.timestamp || new Date(msg.created_at || '').toLocaleString()}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteClick(msg.id)}
                          className="text-xs sm:text-sm px-3 py-1 rounded-lg transition-all hover:scale-105"
                          style={{ backgroundColor: '#FFE7E7', color: '#8B3A2B' }}
                          title="Hapus pesan"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <p className="leading-relaxed text-sm sm:text-base" style={{ color: 'var(--dark-green)' }}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <FadeIn>
            <div className="bg-white rounded-2xl p-8 max-w-sm shadow-2xl">
              <h3 className="font-serif text-2xl mb-4" style={{ color: 'var(--brown)' }}>
                Hapus Pesan?
              </h3>
              <p className="mb-6" style={{ color: 'var(--dark-green)' }}>
                Apakah Anda yakin ingin menghapus pesan ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--beige)', color: 'var(--brown)' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-lg transition-all hover:scale-105"
                  style={{ backgroundColor: '#D32F2F', color: 'white' }}
                >
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
