import { useEffect, useState } from 'react';
import { FadeIn } from './FadeIn';
import { supabase } from '../../supabase';

interface Student {
  id: string;
  name: string;
  class: string;
  photo_url: string;
}

interface ApprovedSubmission {
  id: string;
  image_url: string;
  short_desc: string;
  description?: string | null;
  type: string;
  status: string;
  class?: string | null;
  submitted_by?: string | null;
}

const AVAILABLE_CLASSES = ['11C', '11D', '11I', '11K'];

interface StudentsPageProps {
  onClassSelect?: (className: string | null) => void;
  onUploadOpen?: () => void;
}

export function StudentsPage({ onClassSelect, onUploadOpen }: StudentsPageProps) {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<ApprovedSubmission[]>([]);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const handleClassSelect = (className: string | null) => {
    setSelectedClass(className);
    onClassSelect?.(className);
  };

  const loadData = async () => {
    // Load students
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .order('class', { ascending: true });

    setStudents((studentsData || []) as Student[]);

    // Load approved submissions with type='foto'
    const { data: submissionsData } = await supabase
      .from('submissions')
      .select('*')
      .eq('type', 'foto')
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
    if (!window.confirm('Hapus foto ini?')) return;

    const { error } = await supabase.from('submissions').delete().eq('id', id);
    if (error) {
      alert('Gagal hapus: ' + error.message);
      return;
    }

    loadData();
  };

  const groupedStudents = students.reduce((acc, student) => {
    if (!acc[student.class]) {
      acc[student.class] = [];
    }
    acc[student.class].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  const displayedClasses = selectedClass ? [selectedClass] : AVAILABLE_CLASSES;
  const sortedClasses = displayedClasses.filter(c => groupedStudents[c]).sort();

  const getClassColor = (className: string) => {
    const colorMap: Record<string, string> = {
      '11C': '#0a3323',
      '11D': '#839958',
      '11I': '#d3968c',
      '11K': '#105666',
    };
    return colorMap[className] || '#8B9D77';
  };

  const getBackgroundColor = (className: string | null) => {
    const backgroundMap: Record<string, string> = {
      '11C': '#0a3323',
      '11D': '#839958',
      '11I': '#d3968c',
      '11K': '#105666',
    };
    return className ? backgroundMap[className] : '#F5F1EB';
  };

  const getTextColor = (className: string | null) => {
    const textColorMap: Record<string, string> = {
      '11C': '#ffffff',
      '11D': '#ffffff',
      '11I': '#ffffff',
      '11K': '#ffffff',
    };
    return className ? textColorMap[className] : 'var(--brown)';
  };

  const getAccentColor = (className: string | null) => {
    const accentMap: Record<string, string> = {
      '11C': '#c8e6c9',
      '11D': '#fff9c4',
      '11I': '#ffe0b2',
      '11K': '#b3e5fc',
    };
    return className ? accentMap[className] : 'var(--sage-green)';
  };

  const textColor = getTextColor(selectedClass);
  const accentColor = getAccentColor(selectedClass);

  return (
    <div 
      className="min-h-screen pt-24 pb-16 px-6 transition-colors duration-500" 
      style={{ backgroundColor: getBackgroundColor(selectedClass) }}
    >
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="font-serif text-5xl mb-4 transition-colors duration-500" style={{ color: textColor }}>
              Our Students
            </h1>
            <p style={{ color: textColor }} className="transition-colors duration-500">
              The brilliant minds who made this year unforgettable
            </p>
            {onUploadOpen && (
              <div>
                <button
                  onClick={() => selectedClass && onUploadOpen()}
                  disabled={!selectedClass}
                  className={`mt-6 px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 ${!selectedClass ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: selectedClass ? 'white' : 'var(--dark-green)', color: selectedClass ? 'var(--dark-green)' : 'white' }}
                >
                  Upload Foto
                </button>
                {!selectedClass && (
                  <p className="text-sm mt-2" style={{ color: textColor }}>Pilih kelas terlebih dahulu untuk mengupload foto.</p>
                )}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-12 h-1 rounded transition-colors duration-500" style={{ backgroundColor: accentColor }}></div>
              <svg className="w-5 h-5 transition-colors duration-500" style={{ color: accentColor }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15 8.5L22 9.5L17 14.5L18.5 22L12 18.5L5.5 22L7 14.5L2 9.5L9 8.5L12 2Z"/>
              </svg>
              <div className="w-12 h-1 rounded transition-colors duration-500" style={{ backgroundColor: accentColor }}></div>
            </div>

            {/* Class Selection Buttons */}
            <div className="flex justify-center gap-4 mt-8 flex-wrap">
              <button
                onClick={() => handleClassSelect(null)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedClass === null
                    ? 'text-white shadow-lg'
                    : 'border-2'
                }`}
                style={{
                  backgroundColor: selectedClass === null ? '#2D4A3E' : 'transparent',
                  borderColor: selectedClass === null ? 'transparent' : textColor,
                  color: selectedClass === null ? 'white' : textColor,
                }}
              >
                All Classes
              </button>
              {AVAILABLE_CLASSES.map((className) => (
                <button
                  key={className}
                  onClick={() => handleClassSelect(className)}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    selectedClass === className
                      ? 'text-white shadow-lg'
                      : 'text-white border-2'
                  }`}
                  style={{
                    backgroundColor:
                      selectedClass === className ? getClassColor(className) : 'transparent',
                    borderColor: selectedClass === className ? 'transparent' : textColor,
                    color: selectedClass === className ? 'white' : textColor,
                  }}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {approvedSubmissions.length > 0 && (
          <div className="mb-16">
            <h2 className="font-serif text-3xl mb-6" style={{ color: textColor }}>
              Approved Uploads
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {(selectedClass ? approvedSubmissions.filter(s => s.class === selectedClass) : approvedSubmissions).map((submission) => (
                <div key={submission.id} className="bg-white rounded-xl overflow-hidden shadow-md">
                  <div className="relative overflow-hidden aspect-square p-3">
                    <img
                      src={submission.image_url}
                      alt={submission.short_desc}
                      className="w-full h-full object-cover border-4 border-white shadow-sm cursor-zoom-in"
                      loading="lazy"
                      onClick={() => setPreviewImage({ url: submission.image_url, title: submission.short_desc })}
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-serif text-base mb-1" style={{ color: 'var(--brown)' }}>
                      {submission.short_desc}
                    </h3>
                    {submission.submitted_by && (
                      <p className="text-xs mb-1" style={{ color: 'var(--dark-green)' }}>
                        Oleh: {submission.submitted_by}
                      </p>
                    )}
                    {submission.description && (
                      <p className="text-xs mb-2" style={{ color: 'var(--dark-green)' }}>
                        {submission.description}
                      </p>
                    )}
                    <div className="flex justify-center gap-1 mt-2 mb-2">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: getClassColor('11C') }}></div>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--beige)' }}></div>
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: getClassColor('11C') }}></div>
                    </div>
                    <button
                      onClick={() => handleDelete(submission.id)}
                      className="w-full py-1 text-xs rounded transition-all hover:opacity-80"
                      style={{ backgroundColor: '#8B3A2B', color: 'white' }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedClasses.map((className, classIndex) => {
          const students = groupedStudents[className];
          const classColor = getClassColor(className);

          return (
            <div key={className} className="mb-20">
              <FadeIn delay={classIndex * 100}>
                <div className="relative mb-10">
                  <div
                    className="inline-block px-12 py-6 rounded-2xl shadow-lg relative"
                    style={{
                      backgroundColor: 'white',
                      transform: `rotate(${classIndex % 2 === 0 ? -1 : 1}deg)`,
                    }}
                  >
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 opacity-70"
                      style={{
                        background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, var(--beige) 2px, var(--beige) 4px)',
                      }}
                    >
                      <div className="w-full h-full" style={{
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)',
                      }}></div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center shadow-md"
                        style={{ backgroundColor: classColor }}
                      >
                        <span className="font-serif text-3xl text-white">{className}</span>
                      </div>
                      <div>
                        <h2 className="font-serif text-4xl" style={{ color: 'var(--brown)' }}>
                          Class {className}
                        </h2>
                        <p className="text-sm italic" style={{ color: 'var(--sage-green)' }}>
                          {students.length} wonderful students
                        </p>
                      </div>
                    </div>

                    <div
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-md"
                      style={{ backgroundColor: classColor, opacity: 0.7 }}
                    >
                      <svg className="w-full h-full p-1.5" fill="white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </FadeIn>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {students.map((student, index) => (
                  <FadeIn key={student.id} delay={classIndex * 100 + index * 50}>
                    <div
                      className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                      style={{
                        transform: `rotate(${index % 3 === 0 ? -1 : index % 3 === 1 ? 1 : 0}deg)`,
                      }}
                    >
                      <div className="relative overflow-hidden aspect-square p-3">
                        <img
                          src={student.photo_url}
                          alt={student.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 border-4 border-white shadow-sm cursor-zoom-in"
                          loading="lazy"
                          onClick={() => setPreviewImage({ url: student.photo_url, title: student.name })}
                        />
                        <div
                          className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                          style={{ backgroundColor: classColor }}
                        >
                          <span className="text-white text-xs font-serif">{className}</span>
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-serif text-base mb-1" style={{ color: 'var(--brown)' }}>
                          {student.name}
                        </h3>
                        <div className="flex justify-center gap-1 mt-2">
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: classColor }}></div>
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--beige)' }}></div>
                          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: classColor }}></div>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(26, 46, 34, 0.82)' }}
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg border-2"
              style={{ backgroundColor: 'white', color: 'var(--dark-green)', borderColor: 'var(--dark-green)' }}
              title="Tutup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="text-sm font-medium">Tutup</span>
            </button>

            <div className="w-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--beige)', backgroundColor: '#f7f4ef' }}>
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full max-h-[72vh] object-contain"
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <h3 className="font-serif text-2xl" style={{ color: 'var(--brown)' }}>
                {previewImage.title}
              </h3>
              <a
                href={previewImage.url}
                download
                className="px-5 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'var(--dark-green)', color: 'white' }}
              >
                Download Foto
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
