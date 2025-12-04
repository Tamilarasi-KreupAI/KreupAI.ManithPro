// API Configuration - Disabled for frontend-only mode (using mock data)
export const API_BASE_URL = ''; // No backend - using mock data only
// export const API_BASE_URL = __DEV__
//     ? 'http://localhost:5000/api'
//     : 'https://api.manithpro.com/api';

// Colors - Matching the web app theme
export const COLORS = {
    // Primary Colors
    primary: '#2563eb', // blue-600
    primaryLight: '#3b82f6', // blue-500
    primaryDark: '#1e40af', // blue-700

    // Secondary Colors
    secondary: '#6366f1', // indigo-500
    secondaryLight: '#818cf8', // indigo-400
    secondaryDark: '#4f46e5', // indigo-600

    // Neutral Colors (Slate)
    slate50: '#f8fafc',
    slate100: '#f1f5f9',
    slate200: '#e2e8f0',
    slate300: '#cbd5e1',
    slate400: '#94a3b8',
    slate500: '#64748b',
    slate600: '#475569',
    slate700: '#334155',
    slate800: '#1e293b',
    slate900: '#0f172a',

    // Semantic Colors
    success: '#10b981', // green-500
    successLight: '#34d399', // green-400
    successDark: '#059669', // green-600

    warning: '#f59e0b', // amber-500
    warningLight: '#fbbf24', // amber-400
    warningDark: '#d97706', // amber-600

    error: '#ef4444', // red-500
    errorLight: '#f87171', // red-400
    errorDark: '#dc2626', // red-600

    info: '#3b82f6', // blue-500

    // Background Colors
    white: '#ffffff',
    background: '#ffffff',
    backgroundSecondary: '#f8fafc', // slate-50
    backgroundTertiary: '#f1f5f9', // slate-100

    // Text Colors
    textPrimary: '#0f172a', // slate-900
    textSecondary: '#475569', // slate-600
    textTertiary: '#64748b', // slate-500
    textPlaceholder: '#94a3b8', // slate-400
    textInverse: '#ffffff',

    // Border Colors
    border: '#e2e8f0', // slate-200
    borderLight: '#f1f5f9', // slate-100
    borderDark: '#cbd5e1', // slate-300

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Typography
export const FONTS = {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    italic: 'System',
};

export const FONT_SIZES = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
};

// Spacing
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
};

// Border Radius
export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

// Shadows
export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
};

// Screen Sizes
export const SCREEN_SIZES = {
    sm: 375,
    md: 768,
    lg: 1024,
};

// Animation Durations
export const ANIMATION = {
    fast: 200,
    normal: 300,
    slow: 500,
};

// Routes
export const ROUTES = {
    // Auth
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',

    // Candidate
    CANDIDATE_DASHBOARD: 'CandidateDashboard',
    CANDIDATE_PROFILE: 'CandidateProfile',
    EDIT_PROFILE: 'EditProfile',
    JOBS: 'Jobs',
    JOB_DETAIL: 'JobDetail',
    APPLICATIONS: 'Applications',
    APPLICATION_DETAIL: 'ApplicationDetail',
    MESSAGES: 'Messages',
    MESSAGE_DETAIL: 'MessageDetail',
    INTERVIEWS: 'Interviews',
    SAVED_JOBS: 'SavedJobs',

    // B2B
    B2B_DASHBOARD: 'B2BDashboard',
    BULK_REQUIREMENTS: 'BulkRequirements',
    CREATE_REQUIREMENT: 'CreateRequirement',
    REQUIREMENT_DETAIL: 'RequirementDetail',
    CANDIDATE_SUPPLY: 'CandidateSupply',
    CONTRACTS: 'Contracts',
    CONTRACT_DETAIL: 'ContractDetail',
    INVOICES: 'Invoices',

    // Shared
    SETTINGS: 'Settings',
};

// Storage Keys
export const STORAGE_KEYS = {
    TOKEN: '@ManithPro:token',
    USER: '@ManithPro:user',
    REFRESH_TOKEN: '@ManithPro:refreshToken',
    ONBOARDING_COMPLETED: '@ManithPro:onboardingCompleted',
    THEME: '@ManithPro:theme',
};

// Application Status Colors
export const APPLICATION_STATUS_COLORS: Record<string, string> = {
    PENDING: COLORS.warning,
    UNDER_REVIEW: COLORS.info,
    SHORTLISTED: COLORS.primary,
    INTERVIEW_SCHEDULED: COLORS.secondary,
    OFFER_EXTENDED: COLORS.success,
    ACCEPTED: COLORS.success,
    REJECTED: COLORS.error,
    WITHDRAWN: COLORS.slate400,
};

// Job Type Labels
export const JOB_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: 'Full-Time',
    PART_TIME: 'Part-Time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
};
