import React, { useState } from 'react';
import { applicationService, ApplicationStatus, ApplicationReview as Review } from '../utils/applicationService';

interface ApplicationReviewProps {
  applicationId: string;
  candidateName: string;
  stage: ApplicationStatus;
  onSubmit?: () => void;
  onCancel?: () => void;
}

const ApplicationReview: React.FC<ApplicationReviewProps> = ({
  applicationId,
  candidateName,
  stage,
  onSubmit,
  onCancel,
}) => {
  const [ratings, setRatings] = useState({
    technicalSkills: 0,
    communication: 0,
    cultureFit: 0,
    experience: 0,
    problemSolving: 0,
  });

  const [strengths, setStrengths] = useState<string[]>([]);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<Review['recommendation'] | null>(null);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [strengthInput, setStrengthInput] = useState('');
  const [weaknessInput, setWeaknessInput] = useState('');

  const ratingCategories = [
    { key: 'technicalSkills', label: 'Technical Skills', description: 'Coding ability, technical knowledge, tool proficiency' },
    { key: 'communication', label: 'Communication', description: 'Clarity of expression, listening skills, collaboration' },
    { key: 'cultureFit', label: 'Culture Fit', description: 'Alignment with company values and team dynamics' },
    { key: 'experience', label: 'Experience', description: 'Relevant work history and project background' },
    { key: 'problemSolving', label: 'Problem Solving', description: 'Analytical thinking, creativity, solution-oriented approach' },
  ];

  const recommendations: Array<{ value: Review['recommendation']; label: string; color: string; description: string }> = [
    { value: 'STRONG_YES', label: 'Strong Yes', color: 'bg-green-600 hover:bg-green-700', description: 'Exceptional candidate, hire immediately' },
    { value: 'YES', label: 'Yes', color: 'bg-lime-600 hover:bg-lime-700', description: 'Good fit, recommend moving forward' },
    { value: 'MAYBE', label: 'Maybe', color: 'bg-yellow-600 hover:bg-yellow-700', description: 'Uncertain, needs more evaluation' },
    { value: 'NO', label: 'No', color: 'bg-orange-600 hover:bg-orange-700', description: 'Not a good fit at this time' },
    { value: 'STRONG_NO', label: 'Strong No', color: 'bg-red-600 hover:bg-red-700', description: 'Not suitable for this role' },
  ];

  const handleRatingChange = (category: keyof typeof ratings, rating: number) => {
    setRatings({ ...ratings, [category]: rating });
  };

  const addStrength = () => {
    if (strengthInput.trim() && !strengths.includes(strengthInput.trim())) {
      setStrengths([...strengths, strengthInput.trim()]);
      setStrengthInput('');
    }
  };

  const removeStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const addWeakness = () => {
    if (weaknessInput.trim() && !weaknesses.includes(weaknessInput.trim())) {
      setWeaknesses([...weaknesses, weaknessInput.trim()]);
      setWeaknessInput('');
    }
  };

  const removeWeakness = (index: number) => {
    setWeaknesses(weaknesses.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (Object.values(ratings).some(r => r === 0)) {
      alert('Please provide ratings for all categories');
      return;
    }

    if (!recommendation) {
      alert('Please select a recommendation');
      return;
    }

    if (!comments.trim()) {
      alert('Please provide comments');
      return;
    }

    setSubmitting(true);
    try {
      await applicationService.addReview(applicationId, {
        reviewerId: 'current-user-id', // Would come from auth context
        reviewerName: 'Current User', // Would come from auth context
        stage,
        ratings,
        strengths,
        weaknesses,
        recommendation,
        comments,
      });

      onSubmit?.();
    } catch (error) {
      alert('Failed to submit review');
    }
    setSubmitting(false);
  };

  const renderStarRating = (category: keyof typeof ratings) => {
    const currentRating = ratings[category];
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(category, star)}
            className="transition-transform hover:scale-110"
          >
            <svg
              className={`w-8 h-8 ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentRating === 0 ? 'Not rated' :
           currentRating === 1 ? 'Poor' :
           currentRating === 2 ? 'Fair' :
           currentRating === 3 ? 'Good' :
           currentRating === 4 ? 'Very Good' :
           'Excellent'}
        </span>
      </div>
    );
  };

  const averageRating = Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length;
  const completedRatings = Object.values(ratings).filter(r => r > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl border-2 border-primary-200 dark:border-primary-800 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review: {candidateName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Interview Stage: <strong>{applicationService.getStatusLabel(stage)}</strong>
        </p>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Progress</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {completedRatings} / {ratingCategories.length} ratings
            </p>
          </div>
          {averageRating > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Rating</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {averageRating.toFixed(1)} / 5.0
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Rating Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          Rate Candidate Performance
        </h3>
        <div className="space-y-6">
          {ratingCategories.map((category) => (
            <div key={category.key} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {category.label}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
              {renderStarRating(category.key as keyof typeof ratings)}
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Key Strengths
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          What did the candidate excel at? What were their standout qualities?
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={strengthInput}
            onChange={(e) => setStrengthInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addStrength()}
            placeholder="e.g., Strong system design skills"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={addStrength}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Add
          </button>
        </div>
        {strengths.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {strengths.map((strength, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm"
              >
                {strength}
                <button
                  onClick={() => removeStrength(index)}
                  className="hover:text-green-900 dark:hover:text-green-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Weaknesses/Areas for Improvement */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Areas for Improvement
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          What could the candidate improve on? Any concerns or red flags?
        </p>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={weaknessInput}
            onChange={(e) => setWeaknessInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addWeakness()}
            placeholder="e.g., Limited experience with microservices"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={addWeakness}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Add
          </button>
        </div>
        {weaknesses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {weaknesses.map((weakness, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full text-sm"
              >
                {weakness}
                <button
                  onClick={() => removeWeakness(index)}
                  className="hover:text-orange-900 dark:hover:text-orange-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Overall Recommendation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Overall Recommendation
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Based on your assessment, what is your hiring recommendation?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {recommendations.map((rec) => (
            <button
              key={rec.value}
              onClick={() => setRecommendation(rec.value)}
              className={`p-4 rounded-lg text-white transition-all border-2 ${
                recommendation === rec.value
                  ? 'border-white scale-105'
                  : 'border-transparent'
              } ${rec.color}`}
            >
              <p className="font-bold mb-1">{rec.label}</p>
              <p className="text-xs opacity-90">{rec.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Additional Comments
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Provide detailed feedback about the interview, key discussion points, and any other relevant observations.
        </p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={6}
          placeholder="Share your detailed thoughts on the candidate's performance, specific examples from the interview, and any other relevant context..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {comments.length} characters
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || completedRatings < ratingCategories.length || !recommendation || !comments.trim()}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>

      {/* Progress indicator */}
      {completedRatings < ratingCategories.length && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Incomplete Review</p>
              <p>Please complete all ratings, select a recommendation, and provide comments before submitting.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationReview;
