import React, { useState, useRef } from 'react';

interface VideoIntroductionProps {
  videoUrl?: string;
  editable?: boolean;
  onUpdate?: (url: string) => void;
}

const VideoIntroduction: React.FC<VideoIntroductionProps> = ({
  videoUrl,
  editable = false,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState(videoUrl || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSave = () => {
    if (newVideoUrl && onUpdate) {
      onUpdate(newVideoUrl);
      setIsEditing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setNewVideoUrl(url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 60000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Introduction</h2>
          <p className="text-sm text-gray-600 mt-1">30-60 second pitch to stand out</p>
        </div>
        {editable && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            {videoUrl ? 'Update' : 'Add Video'}
          </button>
        )}
      </div>

      {/* View Mode */}
      {!isEditing && videoUrl && (
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            poster="https://via.placeholder.com/1280x720?text=Video+Introduction"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {!isEditing && !videoUrl && (
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center p-8">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No video introduction yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add a 30-60 second video to introduce yourself and stand out to recruiters
            </p>
            {editable && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-6">
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
            {isRecording || recordedBlob ? (
              <video
                ref={videoRef}
                autoPlay={isRecording}
                src={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
                controls={!isRecording && recordedBlob !== null}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <div className="text-center text-white p-8">
                  <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Camera preview will appear here</p>
                </div>
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {!isRecording && !recordedBlob && (
                <button
                  onClick={startRecording}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="8" />
                  </svg>
                  Start Recording
                </button>
              )}

              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="6" width="8" height="8" />
                  </svg>
                  Stop Recording
                </button>
              )}

              {recordedBlob && !isRecording && (
                <>
                  <button
                    onClick={() => {
                      setRecordedBlob(null);
                      setNewVideoUrl('');
                    }}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={() => {
                      // In a real app, upload the blob to server and get URL
                      alert('In production, this would upload to server. For demo, using local blob URL.');
                      handleSave();
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Use This Video
                  </button>
                </>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>Or provide a video URL (YouTube, Vimeo, etc.)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
              <input
                type="url"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!newVideoUrl}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Video
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewVideoUrl(videoUrl || '');
                  setRecordedBlob(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Video Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Keep it between 30-60 seconds</li>
              <li>• Introduce yourself and your key skills</li>
              <li>• Explain what you're looking for in your next role</li>
              <li>• Be authentic and enthusiastic</li>
              <li>• Ensure good lighting and clear audio</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoIntroduction;
