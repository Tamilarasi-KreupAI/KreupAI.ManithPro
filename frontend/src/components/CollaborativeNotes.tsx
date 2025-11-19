import React, { useState, useEffect } from 'react';
import { collaborativeNotesService, Note } from '../utils/collaborativeNotesService';
import PresenceIndicator from './PresenceIndicator';

interface CollaborativeNotesProps {
  candidateId: string;
  currentUserId: string;
}

const CollaborativeNotes: React.FC<CollaborativeNotesProps> = ({
  candidateId,
  currentUserId,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadNotes();

    // Subscribe to real-time updates
    const unsubscribe = collaborativeNotesService.onUpdate(() => {
      loadNotes();
    });

    return unsubscribe;
  }, [candidateId]);

  const loadNotes = async () => {
    setLoading(true);
    const data = await collaborativeNotesService.getCandidateNotes(candidateId);
    setNotes(data);
    setLoading(false);
  };

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return;

    const tags = newNoteTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const result = await collaborativeNotesService.createNote(candidateId, newNoteContent, {
      tags,
      isPrivate,
    });

    if (result.success) {
      setNewNoteContent('');
      setNewNoteTags('');
      setIsPrivate(false);
      setIsAddingNote(false);
      await loadNotes();
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    const result = await collaborativeNotesService.updateNote(noteId, {
      content: editContent,
    });

    if (result.success) {
      setEditingNoteId(null);
      setEditContent('');
      await loadNotes();
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    const result = await collaborativeNotesService.deleteNote(noteId);
    if (result.success) {
      await loadNotes();
    }
  };

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    await collaborativeNotesService.togglePin(noteId, !currentPinned);
    await loadNotes();
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Team Notes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Collaborate with your team on this candidate
          </p>
        </div>
        <button
          onClick={() => setIsAddingNote(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Note
        </button>
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-primary-500">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note Content
            </label>
            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Add your note here... Use @username to mention teammates"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
              rows={4}
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={newNoteTags}
              onChange={(e) => setNewNoteTags(e.target.value)}
              placeholder="e.g., strong-candidate, needs-follow-up, technical-excellent"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="private-note"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="private-note" className="text-sm text-gray-700 dark:text-gray-300">
              Private note (only visible to you)
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateNote}
              disabled={!newNoteContent.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Save Note
            </button>
            <button
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent('');
                setNewNoteTags('');
                setIsPrivate(false);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-2 ${
                note.isPinned
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {note.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {note.authorName}
                      </span>
                      <PresenceIndicator userId={note.authorId} size="sm" />
                      {note.isPrivate && (
                        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                          Private
                        </span>
                      )}
                      {note.isPinned && (
                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(note.createdAt)}
                      {note.updatedAt.getTime() !== note.createdAt.getTime() && ' (edited)'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {note.authorId === currentUserId && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleTogglePin(note.id, note.isPinned)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditContent(note.content);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors text-red-600"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Note Content */}
              {editingNoteId === note.id ? (
                <div className="mb-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm dark:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3">
                  {note.content}
                </p>
              )}

              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            No notes yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Start collaborating by adding the first note
          </p>
          <button
            onClick={() => setIsAddingNote(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add First Note
          </button>
        </div>
      )}
    </div>
  );
};

export default CollaborativeNotes;
