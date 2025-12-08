import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../../services/candidateProfileAPI';
import type { CandidateSkill, SkillsMatrix as SkillsMatrixType, SkillProficiencyLevel } from '../../types';

interface SkillsMatrixProps {
  onUpdate: () => void;
}

const PROFICIENCY_LABELS: { value: SkillProficiencyLevel; label: string; color: string }[] = [
  { value: 'BEGINNER', label: 'Beginner', color: 'bg-gray-200 dark:bg-gray-600' },
  { value: 'ELEMENTARY', label: 'Elementary', color: 'bg-yellow-200 dark:bg-yellow-700' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-blue-200 dark:bg-blue-700' },
  { value: 'ADVANCED', label: 'Advanced', color: 'bg-green-200 dark:bg-green-700' },
  { value: 'EXPERT', label: 'Expert', color: 'bg-purple-200 dark:bg-purple-700' },
];

const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frontend',
  'Backend',
  'Databases',
  'Cloud & DevOps',
  'Tools & Technologies',
  'Soft Skills',
  'Other',
];

const SkillsMatrix: React.FC<SkillsMatrixProps> = ({ onUpdate }) => {
  const [skillsData, setSkillsData] = useState<SkillsMatrixType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CandidateSkill | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    proficiencyLevel: 5,
    yearsOfExperience: '',
    isPrimary: false,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [bulkSkills, setBulkSkills] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await skillsAPI.getMatrix();
      setSkillsData(data);
    } catch (err) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyColor = (level: number) => {
    if (level <= 2) return 'bg-gray-400';
    if (level <= 4) return 'bg-yellow-400';
    if (level <= 6) return 'bg-blue-400';
    if (level <= 8) return 'bg-green-400';
    return 'bg-purple-500';
  };

  const getProficiencyLabel = (level: number): string => {
    if (level <= 2) return 'Beginner';
    if (level <= 4) return 'Elementary';
    if (level <= 6) return 'Intermediate';
    if (level <= 8) return 'Advanced';
    return 'Expert';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? parseFloat(formData.yearsOfExperience) : undefined,
        proficiencyLabel: getProficiencyLabel(formData.proficiencyLevel) as SkillProficiencyLevel,
      };

      if (editingSkill) {
        await skillsAPI.update(editingSkill.id, data);
      } else {
        await skillsAPI.add(data);
      }
      await loadSkills();
      onUpdate();
      resetForm();
    } catch (err) {
      console.error('Failed to save skill:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkSkills.trim()) return;
    setSaving(true);
    try {
      const skills = bulkSkills
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter((s) => s)
        .map((name) => ({ name, category: 'Other', proficiencyLevel: 5 }));

      await skillsAPI.bulkAdd(skills);
      await loadSkills();
      onUpdate();
      setBulkSkills('');
      setShowBulkAdd(false);
    } catch (err) {
      console.error('Failed to bulk add skills:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (skill: CandidateSkill) => {
    setFormData({
      name: skill.name,
      category: skill.category || '',
      proficiencyLevel: skill.proficiencyLevel,
      yearsOfExperience: skill.yearsOfExperience?.toString() || '',
      isPrimary: skill.isPrimary,
      tags: skill.tags || [],
    });
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await skillsAPI.delete(id);
      await loadSkills();
      onUpdate();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      proficiencyLevel: 5,
      yearsOfExperience: '',
      isPrimary: false,
      tags: [],
    });
    setEditingSkill(null);
    setShowForm(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Skills Matrix
            </h2>
            {skillsData && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {skillsData.summary.total} skills • {skillsData.summary.totalEndorsements} endorsements
              </p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowBulkAdd(true)}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              Bulk Add
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Skill</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {skillsData && (
          <div className="grid grid-cols-5 gap-4 mt-6">
            {PROFICIENCY_LABELS.map((prof) => (
              <div key={prof.value} className="text-center">
                <div className={`h-2 rounded-full ${prof.color} mb-2`}></div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{prof.label}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {skillsData.summary.byProficiency[prof.value.toLowerCase() as keyof typeof skillsData.summary.byProficiency]}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bulk Add Skills
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Enter multiple skills separated by commas or new lines
            </p>
            <textarea
              value={bulkSkills}
              onChange={(e) => setBulkSkills(e.target.value)}
              rows={5}
              placeholder="React, Node.js, TypeScript, PostgreSQL..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowBulkAdd(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkAdd}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Skills'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={!!editingSkill}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select category</option>
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proficiency Level: {formData.proficiencyLevel}/10 ({getProficiencyLabel(formData.proficiencyLevel)})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.proficiencyLevel}
                onChange={(e) => setFormData({ ...formData, proficiencyLevel: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Beginner</span>
                <span>Elementary</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Primary/Featured Skill
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => removeTag(index)} className="ml-2">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving...' : editingSkill ? 'Update Skill' : 'Add Skill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Skills Display */}
      {skillsData && Object.keys(skillsData.matrix).length > 0 ? (
        viewMode === 'grid' ? (
          <div className="space-y-6">
            {Object.entries(skillsData.matrix).map(([category, skills]) => (
              <div key={category} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                        <button onClick={() => handleEdit(skill)} className="p-1 text-gray-400 hover:text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(skill.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {skill.name}
                        </span>
                        {skill.isPrimary && (
                          <span className="w-2 h-2 bg-yellow-400 rounded-full" title="Primary Skill"></span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${getProficiencyColor(skill.proficiencyLevel)}`}
                            style={{ width: `${skill.proficiencyLevel * 10}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {skill.proficiencyLevel}/10
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{getProficiencyLabel(skill.proficiencyLevel)}</span>
                        {skill.endorsementCount > 0 && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {skill.endorsementCount}
                          </span>
                        )}
                      </div>
                      {skill.isVerified && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Skill</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Endorsements</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.values(skillsData.matrix).flat().map((skill) => (
                  <tr key={skill.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                        {skill.isPrimary && <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full" title="Primary"></span>}
                        {skill.isVerified && <span className="ml-2 text-green-500"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{skill.category || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${getProficiencyColor(skill.proficiencyLevel)}`} style={{ width: `${skill.proficiencyLevel * 10}%` }} />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{skill.proficiencyLevel}/10</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {skill.yearsOfExperience ? `${skill.yearsOfExperience} years` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{skill.endorsementCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => handleEdit(skill)} className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3">Edit</button>
                      <button onClick={() => handleDelete(skill.id)} className="text-red-600 hover:text-red-900 dark:hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No skills added yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Add your professional skills to showcase your expertise</p>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Add Your First Skill
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillsMatrix;
