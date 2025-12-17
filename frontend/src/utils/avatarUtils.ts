/**
 * Generate a consistent color gradient for user avatars based on their name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns CSS gradient classes for avatar background
 */
export const getAvatarGradient = (firstName: string, lastName: string): string => {
  const fullName = `${firstName}${lastName}`.toLowerCase();

  // Generate a hash from the name
  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Predefined beautiful gradient combinations
  const gradients = [
    'from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700',
    'from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700',
    'from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700',
    'from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700',
    'from-cyan-600 to-blue-600 dark:from-cyan-700 dark:to-blue-700',
    'from-pink-600 to-rose-600 dark:from-pink-700 dark:to-rose-700',
    'from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700',
    'from-teal-600 to-green-600 dark:from-teal-700 dark:to-green-700',
    'from-yellow-600 to-orange-600 dark:from-yellow-700 dark:to-orange-700',
    'from-emerald-600 to-cyan-600 dark:from-emerald-700 dark:to-cyan-700',
  ];

  // Use hash to select a gradient consistently
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

/**
 * Get user initials from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Uppercase initials (e.g., "JD")
 */
export const getUserInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim().charAt(0).toUpperCase() || 'U';
  const last = lastName?.trim().charAt(0).toUpperCase() || 'U';
  return `${first}${last}`;
};

/**
 * Generate a ring color based on user name for avatar border
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns CSS ring color classes
 */
export const getAvatarRingColor = (firstName: string, lastName: string): string => {
  const fullName = `${firstName}${lastName}`.toLowerCase();

  let hash = 0;
  for (let i = 0; i < fullName.length; i++) {
    hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const ringColors = [
    'ring-blue-100 dark:ring-blue-900/30',
    'ring-purple-100 dark:ring-purple-900/30',
    'ring-green-100 dark:ring-green-900/30',
    'ring-orange-100 dark:ring-orange-900/30',
    'ring-cyan-100 dark:ring-cyan-900/30',
    'ring-pink-100 dark:ring-pink-900/30',
    'ring-indigo-100 dark:ring-indigo-900/30',
    'ring-teal-100 dark:ring-teal-900/30',
    'ring-yellow-100 dark:ring-yellow-900/30',
    'ring-emerald-100 dark:ring-emerald-900/30',
  ];

  const index = Math.abs(hash) % ringColors.length;
  return ringColors[index];
};
