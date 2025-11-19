/**
 * Collaborative Notes Service
 * Manages shared notes on candidates and applications
 */

import { websocketService } from './websocketService';

export interface Note {
  id: string;
  candidateId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  isPinned: boolean;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  mentions?: string[]; // User IDs mentioned in the note
}

export interface NoteComment {
  id: string;
  noteId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

class CollaborativeNotesService {
  private static instance: CollaborativeNotesService;
  private notesCache: Map<string, Note[]> = new Map();
  private updateCallbacks: Set<() => void> = new Set();

  private constructor() {
    // Listen for real-time note updates
    websocketService.on('note_update', (data) => {
      this.handleNoteUpdate(data);
    });
  }

  static getInstance(): CollaborativeNotesService {
    if (!CollaborativeNotesService.instance) {
      CollaborativeNotesService.instance = new CollaborativeNotesService();
    }
    return CollaborativeNotesService.instance;
  }

  /**
   * Get notes for a candidate
   */
  async getCandidateNotes(candidateId: string): Promise<Note[]> {
    // Check cache first
    if (this.notesCache.has(candidateId)) {
      return this.notesCache.get(candidateId)!;
    }

    try {
      const response = await fetch(`/api/notes/candidate/${candidateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const notes: Note[] = data.map((note: any) => ({
        id: note.id,
        candidateId: note.candidateId,
        authorId: note.authorId,
        authorName: note.authorName,
        authorAvatar: note.authorAvatar,
        content: note.content,
        isPinned: note.isPinned || false,
        isPrivate: note.isPrivate || false,
        tags: note.tags || [],
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        mentions: note.mentions,
      }));

      // Sort: pinned first, then by updated date
      notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });

      this.notesCache.set(candidateId, notes);
      return notes;
    } catch (error) {
      console.error('Failed to fetch candidate notes:', error);
      return [];
    }
  }

  /**
   * Create a new note
   */
  async createNote(
    candidateId: string,
    content: string,
    options?: {
      isPinned?: boolean;
      isPrivate?: boolean;
      tags?: string[];
    }
  ): Promise<{ success: boolean; noteId?: string; message: string }> {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          candidateId,
          content,
          isPinned: options?.isPinned || false,
          isPrivate: options?.isPrivate || false,
          tags: options?.tags || [],
          mentions: this.extractMentions(content),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Invalidate cache
        this.notesCache.delete(candidateId);

        // Notify via WebSocket
        websocketService.send('note_update', {
          action: 'create',
          candidateId,
          noteId: data.noteId,
        });

        return {
          success: true,
          noteId: data.noteId,
          message: 'Note created successfully',
        };
      }

      return {
        success: false,
        message: data.message || 'Failed to create note',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create note',
      };
    }
  }

  /**
   * Update a note
   */
  async updateNote(
    noteId: string,
    updates: {
      content?: string;
      isPinned?: boolean;
      isPrivate?: boolean;
      tags?: string[];
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...updates,
          mentions: updates.content ? this.extractMentions(updates.content) : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Invalidate cache
        this.invalidateCache();

        // Notify via WebSocket
        websocketService.send('note_update', {
          action: 'update',
          noteId,
        });

        return {
          success: true,
          message: 'Note updated successfully',
        };
      }

      return {
        success: false,
        message: data.message || 'Failed to update note',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update note',
      };
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Invalidate cache
        this.invalidateCache();

        // Notify via WebSocket
        websocketService.send('note_update', {
          action: 'delete',
          noteId,
        });

        return {
          success: true,
          message: 'Note deleted successfully',
        };
      }

      return {
        success: false,
        message: data.message || 'Failed to delete note',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete note',
      };
    }
  }

  /**
   * Toggle pin status
   */
  async togglePin(noteId: string, isPinned: boolean): Promise<{ success: boolean }> {
    const result = await this.updateNote(noteId, { isPinned });
    return { success: result.success };
  }

  /**
   * Extract @mentions from note content
   */
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }

  /**
   * Handle real-time note updates
   */
  private handleNoteUpdate(data: any): void {
    // Invalidate cache for affected candidate
    if (data.candidateId) {
      this.notesCache.delete(data.candidateId);
    } else {
      this.invalidateCache();
    }

    // Notify subscribers
    this.notifyUpdate();
  }

  /**
   * Subscribe to note updates
   */
  onUpdate(callback: () => void): () => void {
    this.updateCallbacks.add(callback);
    return () => {
      this.updateCallbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifyUpdate(): void {
    this.updateCallbacks.forEach(callback => callback());
  }

  /**
   * Invalidate all cache
   */
  private invalidateCache(): void {
    this.notesCache.clear();
  }
}

export const collaborativeNotesService = CollaborativeNotesService.getInstance();
