import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading resumes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Resume Manager</h1>
        <p className="text-gray-600 mb-8">
          Upload and manage your resumes. Use them when applying for jobs.
        </p>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">Upload New Resume</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{getFileIcon(selectedFile.name)}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400"
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📤</div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-600">
                  PDF, DOC, or DOCX (max 5MB)
                </p>
              </label>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Tips for a great resume:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Keep it to 1-2 pages</li>
              <li>Use a clean, professional format</li>
              <li>Include relevant keywords from job descriptions</li>
              <li>Highlight achievements with metrics</li>
              <li>Proofread for errors</li>
            </ul>
          </div>
        </div>

        {/* Resumes List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-6">Your Resumes ({resumes.length})</h2>

          {resumes.length > 0 ? (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`border rounded-lg p-6 transition-all ${
                    resume.isDefault
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-4xl">{getFileIcon(resume.fileName)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{resume.fileName}</h3>
                          {resume.isDefault && (
                            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>📊 {formatFileSize(resume.fileSize)}</span>
                          <span>📅 {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <a
                        href={`http://localhost:5000${resume.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 text-sm font-medium"
                      >
                        Preview
                      </a>
                      {!resume.isDefault && (
                        <button
                          onClick={() => handleSetDefault(resume.id)}
                          className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-sm font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(resume.id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {resume.isDefault && (
                    <div className="mt-4 pt-4 border-t border-primary-200">
                      <p className="text-sm text-primary-800">
                        ✨ This resume will be used by default when applying for jobs
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-medium mb-2">No resumes uploaded yet</p>
              <p className="text-sm">Upload your first resume to get started!</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-blue-800">
            Keep multiple versions of your resume tailored for different types of jobs. Set your most general resume as default, and select specific ones when applying to specialized positions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
