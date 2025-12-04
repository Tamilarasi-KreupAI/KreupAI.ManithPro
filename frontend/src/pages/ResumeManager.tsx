import React, { useEffect, useState } from 'react';

interface Resume {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: string;
  isDefault: boolean;
}

const ResumeManager: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      // For now, using mock data. In production, this would call an API
      // const data = await userAPI.getResumes();
      const mockResumes: Resume[] = [
        {
          id: '1',
          fileName: 'John_Doe_Resume_2024.pdf',
          filePath: '/uploads/resume-1.pdf',
          fileSize: 245000,
          uploadedAt: new Date().toISOString(),
          isDefault: true,
        },
      ];
      setResumes(mockResumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5242880) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      // In production, this would call the API
      // await userAPI.uploadResume(formData);

      // Mock upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newResume: Resume = {
        id: Date.now().toString(),
        fileName: selectedFile.name,
        filePath: '/uploads/' + selectedFile.name,
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        isDefault: resumes.length === 0,
      };

      setResumes([...resumes, newResume]);
      setSelectedFile(null);
      alert('Resume uploaded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      // In production: await userAPI.setDefaultResume(resumeId);
      setResumes(resumes.map(r => ({
        ...r,
        isDefault: r.id === resumeId
      })));
      alert('Default resume updated');
    } catch (error: any) {
      alert('Failed to set default resume');
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      // In production: await userAPI.deleteResume(resumeId);
      setResumes(resumes.filter(r => r.id !== resumeId));
      alert('Resume deleted successfully');
    } catch (error: any) {
      alert('Failed to delete resume');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return '📕';
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) return '📘';
    return '📄';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50 to-transparent -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Resume Manager</h1>
          <p className="text-slate-500 mt-2">
            Upload and manage your resumes. Use them when applying for jobs.
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Upload New Resume</h2>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all group">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />

            {selectedFile ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl bg-white p-3 rounded-xl shadow-sm">{getFileIcon(selectedFile.name)}</span>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 text-lg">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="resume-upload" className="cursor-pointer block">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">📤</span>
                </div>
                <p className="text-lg font-bold text-slate-900 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-slate-500">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
              </label>
            )}
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span className="text-blue-600 text-xl">💡</span>
            <div className="text-sm text-blue-900">
              <p className="font-bold mb-1">Tips for a great resume:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 ml-1">
                <li>Keep it to 1-2 pages</li>
                <li>Use a clean, professional format</li>
                <li>Include relevant keywords from job descriptions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resumes List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Your Resumes ({resumes.length})</h2>

          {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`border rounded-xl p-6 transition-all hover:shadow-md ${resume.isDefault
                    ? 'border-blue-200 bg-blue-50/30'
                    : 'border-slate-200 hover:border-blue-200 bg-white'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl bg-white p-2 rounded-lg shadow-sm border border-slate-100">{getFileIcon(resume.fileName)}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{resume.fileName}</h3>
                          {resume.isDefault && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">📊 {formatFileSize(resume.fileSize)}</span>
                          <span className="flex items-center gap-1">📅 {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:ml-auto">
                      <a
                        href={`http://localhost:5001${resume.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        Preview
                      </a>
                      {!resume.isDefault && (
                        <button
                          onClick={() => handleSetDefault(resume.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {resume.isDefault && (
                    <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-2 text-sm text-blue-700">
                      <span>✨</span>
                      This resume will be used by default when applying for jobs
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="text-6xl mb-4 opacity-50">📁</div>
              <p className="text-lg font-bold text-slate-900 mb-2">No resumes uploaded yet</p>
              <p className="text-slate-500">Upload your first resume to get started!</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-4">
            <span className="text-3xl bg-white/20 p-2 rounded-lg backdrop-blur-sm">💡</span>
            <div>
              <h3 className="font-bold text-lg mb-1">Pro Tip</h3>
              <p className="text-blue-100 leading-relaxed">
                Keep multiple versions of your resume tailored for different types of jobs. Set your most general resume as default, and select specific ones when applying to specialized positions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
