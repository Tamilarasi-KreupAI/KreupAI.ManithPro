// ============================================================
// USER PROFILE INTEGRATION TESTS
// Tests for user profile and settings management
// ============================================================

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils';
import { server } from '../msw';
import { http, HttpResponse } from 'msw';
import { useState, useEffect } from 'react';
import userEvent from '@testing-library/user-event';

// ============================================
// Test Setup
// ============================================
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================
// Types
// ============================================
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatar?: string;
  preferences: {
    emailNotifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

// ============================================
// Mock Data
// ============================================
const mockUser: User = {
  id: 'user-1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'RECRUITER',
  phone: '+1234567890',
  preferences: {
    emailNotifications: true,
    theme: 'light',
    language: 'en',
  },
};

// ============================================
// User Profile Component
// ============================================
interface UserProfileProps {
  onUpdate?: (user: User) => void;
}

const UserProfile = ({ onUpdate }: UserProfileProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/users/me');
        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        setUser(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditMode(false);
      setSuccess(true);
      onUpdate?.(updatedUser);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
      });
    }
    setEditMode(false);
    setError(null);
  };

  if (loading) {
    return <div role="status">Loading profile...</div>;
  }

  if (!user) {
    return <div role="alert">Failed to load profile</div>;
  }

  return (
    <div>
      <h1>Profile Settings</h1>

      {error && <div role="alert" className="error">{error}</div>}
      {success && <div role="status" className="success">Profile updated successfully!</div>}

      {editMode ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          <dl>
            <dt>Name</dt>
            <dd>{user.firstName} {user.lastName}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Phone</dt>
            <dd>{user.phone || 'Not set'}</dd>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </dl>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

// ============================================
// Password Change Component
// ============================================
interface PasswordChangeProps {
  onSuccess?: () => void;
}

const PasswordChange = ({ onSuccess }: PasswordChangeProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/v1/users/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Change Password</h2>

      {error && <div role="alert" className="error">{error}</div>}
      {success && <div role="status" className="success">Password changed successfully!</div>}

      <div>
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
};

// ============================================
// Preferences Component
// ============================================
const UserPreferences = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    theme: 'light' as 'light' | 'dark' | 'system',
    language: 'en',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch('/api/v1/users/me/preferences');
        if (!response.ok) throw new Error('Failed to fetch preferences');

        const data = await response.json();
        setPreferences(data);
      } catch (err) {
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleChange = async (key: string, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/v1/users/me/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) throw new Error('Failed to save preference');

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError('Failed to save preference');
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div role="status">Loading preferences...</div>;
  }

  return (
    <div>
      <h2>Preferences</h2>

      {error && <div role="alert">{error}</div>}
      {success && <div role="status">Preference saved!</div>}

      <div>
        <label>
          <input
            type="checkbox"
            checked={preferences.emailNotifications}
            onChange={(e) => handleChange('emailNotifications', e.target.checked)}
            disabled={saving}
          />
          Email Notifications
        </label>
      </div>

      <div>
        <label htmlFor="theme">Theme</label>
        <select
          id="theme"
          value={preferences.theme}
          onChange={(e) => handleChange('theme', e.target.value)}
          disabled={saving}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>

      <div>
        <label htmlFor="language">Language</label>
        <select
          id="language"
          value={preferences.language}
          onChange={(e) => handleChange('language', e.target.value)}
          disabled={saving}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>
    </div>
  );
};

// ============================================
// Tests
// ============================================
describe('User Profile Integration', () => {
  describe('UserProfile', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/v1/users/me', () => {
          return HttpResponse.json(mockUser);
        })
      );
    });

    it('displays loading state initially', () => {
      render(<UserProfile />);
      expect(screen.getByRole('status')).toHaveTextContent('Loading profile...');
    });

    it('displays user profile information', async () => {
      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('RECRUITER')).toBeInTheDocument();
    });

    it('enters edit mode when clicking Edit Profile', async () => {
      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Edit Profile'));

      expect(screen.getByLabelText('First Name')).toHaveValue('John');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    });

    it('updates profile successfully', async () => {
      const onUpdate = vi.fn();

      server.use(
        http.patch('/api/v1/users/me', async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          return HttpResponse.json({
            ...mockUser,
            ...body,
          });
        })
      );

      render(<UserProfile onUpdate={onUpdate} />);

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Edit Profile'));

      const firstNameInput = screen.getByLabelText('First Name');
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'Jane');

      await userEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });

      expect(onUpdate).toHaveBeenCalled();
    });

    it('cancels edit and reverts changes', async () => {
      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Edit Profile'));

      const firstNameInput = screen.getByLabelText('First Name');
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'Changed');

      await userEvent.click(screen.getByText('Cancel'));

      // Should be back in view mode with original data
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('handles update error', async () => {
      server.use(
        http.patch('/api/v1/users/me', () => {
          return HttpResponse.json({ error: 'Update failed' }, { status: 500 });
        })
      );

      render(<UserProfile />);

      await waitFor(() => {
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('Edit Profile'));
      await userEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to save changes');
      });
    });
  });

  describe('PasswordChange', () => {
    it('validates password match', async () => {
      render(<PasswordChange />);

      await userEvent.type(screen.getByLabelText('Current Password'), 'oldpassword');
      await userEvent.type(screen.getByLabelText('New Password'), 'newpassword123');
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'differentpassword');

      await userEvent.click(screen.getByText('Change Password'));

      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });

    it('validates password length', async () => {
      render(<PasswordChange />);

      await userEvent.type(screen.getByLabelText('Current Password'), 'oldpassword');
      await userEvent.type(screen.getByLabelText('New Password'), 'short');
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'short');

      await userEvent.click(screen.getByText('Change Password'));

      expect(screen.getByRole('alert')).toHaveTextContent('Password must be at least 8 characters');
    });

    it('changes password successfully', async () => {
      const onSuccess = vi.fn();

      server.use(
        http.put('/api/v1/users/me/password', () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<PasswordChange onSuccess={onSuccess} />);

      await userEvent.type(screen.getByLabelText('Current Password'), 'oldpassword');
      await userEvent.type(screen.getByLabelText('New Password'), 'newpassword123');
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpassword123');

      await userEvent.click(screen.getByText('Change Password'));

      await waitFor(() => {
        expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('handles incorrect current password', async () => {
      server.use(
        http.put('/api/v1/users/me/password', () => {
          return HttpResponse.json(
            { error: 'Current password is incorrect' },
            { status: 400 }
          );
        })
      );

      render(<PasswordChange />);

      await userEvent.type(screen.getByLabelText('Current Password'), 'wrongpassword');
      await userEvent.type(screen.getByLabelText('New Password'), 'newpassword123');
      await userEvent.type(screen.getByLabelText('Confirm New Password'), 'newpassword123');

      await userEvent.click(screen.getByText('Change Password'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Current password is incorrect');
      });
    });
  });

  describe('UserPreferences', () => {
    beforeEach(() => {
      server.use(
        http.get('/api/v1/users/me/preferences', () => {
          return HttpResponse.json({
            emailNotifications: true,
            theme: 'light',
            language: 'en',
          });
        })
      );
    });

    it('displays preferences', async () => {
      render(<UserPreferences />);

      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      });

      expect(screen.getByLabelText('Theme')).toHaveValue('light');
      expect(screen.getByLabelText('Language')).toHaveValue('en');
    });

    it('updates email notification preference', async () => {
      server.use(
        http.patch('/api/v1/users/me/preferences', () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<UserPreferences />);

      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('Preference saved!')).toBeInTheDocument();
      });
    });

    it('updates theme preference', async () => {
      server.use(
        http.patch('/api/v1/users/me/preferences', () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<UserPreferences />);

      await waitFor(() => {
        expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      });

      await userEvent.selectOptions(screen.getByLabelText('Theme'), 'dark');

      await waitFor(() => {
        expect(screen.getByText('Preference saved!')).toBeInTheDocument();
      });
    });

    it('handles preference save error', async () => {
      server.use(
        http.patch('/api/v1/users/me/preferences', () => {
          return HttpResponse.json({ error: 'Save failed' }, { status: 500 });
        })
      );

      render(<UserPreferences />);

      await waitFor(() => {
        expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      });

      await userEvent.selectOptions(screen.getByLabelText('Theme'), 'dark');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Failed to save preference');
      });

      // Should revert to original value
      expect(screen.getByLabelText('Theme')).toHaveValue('light');
    });
  });
});
