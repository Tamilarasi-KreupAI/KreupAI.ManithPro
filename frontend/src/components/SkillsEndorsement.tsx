import React, { useState } from 'react';

interface Skill {
  name: string;
  endorsements: number;
  endorsedBy?: string[];
}

interface SkillsEndorsementProps {
  skills: Skill[];
  canEndorse?: boolean;
  onEndorse?: (skillName: string) => void;
}

const SkillsEndorsement: React.FC<SkillsEndorsementProps> = ({
  skills = [],
  canEndorse = false,
  onEndorse,
}) => {
  const [endorsedSkills, setEndorsedSkills] = useState<Set<string>>(new Set());

  const handleEndorse = (skillName: string) => {
    if (!canEndorse || endorsedSkills.has(skillName)) return;

    setEndorsedSkills(new Set(endorsedSkills).add(skillName));
    if (onEndorse) {
      onEndorse(skillName);
    }
  };

  const getSkillLevel = (endorsements: number): { color: string; label: string } => {
    if (endorsements >= 20) return { color: 'bg-purple-500', label: 'Expert' };
    if (endorsements >= 10) return { color: 'bg-blue-500', label: 'Advanced' };
    if (endorsements >= 5) return { color: 'bg-green-500', label: 'Intermediate' };
    return { color: 'bg-gray-400', label: 'Beginner' };
  };

  const sortedSkills = [...skills].sort((a, b) => b.endorsements - a.endorsements);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Endorsements</h2>
        <p className="text-sm text-gray-600">
          {canEndorse
            ? 'Endorse skills to help this candidate stand out'
            : 'Skills endorsed by recruiters and peers'}
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No skills added yet</h3>
          <p className="mt-1 text-sm text-gray-500">Add skills to your profile to get endorsements</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedSkills.map((skill) => {
            const level = getSkillLevel(skill.endorsements);
            const isEndorsed = endorsedSkills.has(skill.name);
            const canEndorseThis = canEndorse && !isEndorsed;

            return (
              <div
                key={skill.name}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-2 h-2 rounded-full ${level.color}`} />
                    <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {level.label}
                    </span>
                  </div>

                  {canEndorseThis && (
                    <button
                      onClick={() => handleEndorse(skill.name)}
                      className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      Endorse
                    </button>
                  )}

                  {isEndorsed && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Endorsed
                    </span>
                  )}
                </div>

                {/* Endorsement Count */}
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        {skill.endorsements} {skill.endorsements === 1 ? 'endorsement' : 'endorsements'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${level.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((skill.endorsements / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{skill.endorsements}</span>
                  </div>
                </div>

                {/* Endorsed By (if available) */}
                {skill.endorsedBy && skill.endorsedBy.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 mb-2">Endorsed by:</p>
                    <div className="flex flex-wrap gap-2">
                      {skill.endorsedBy.slice(0, 5).map((name, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                          {name}
                        </span>
                      ))}
                      {skill.endorsedBy.length > 5 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          +{skill.endorsedBy.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {skills.length > 0 && (
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{skills.length}</p>
            <p className="text-sm text-gray-600">Skills</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              {skills.reduce((sum, skill) => sum + skill.endorsements, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Endorsements</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {skills.filter(s => s.endorsements >= 10).length}
            </p>
            <p className="text-sm text-gray-600">Advanced+</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsEndorsement;
