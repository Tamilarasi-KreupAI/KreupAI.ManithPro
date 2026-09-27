export type B2BSubmissionStatus =
  | 'SUBMITTED'
  | 'SHORTLISTED'
  | 'REJECTED'
  | 'PLACED'
  | 'WITHDRAWN';

const allowedTransitions: Record<
  B2BSubmissionStatus,
  B2BSubmissionStatus[]
> = {
  SUBMITTED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['PLACED', 'REJECTED', 'WITHDRAWN'],
  REJECTED: [],
  PLACED: [],
  WITHDRAWN: [],
};

export const isValidSubmissionTransition = (
  currentStatus: string,
  nextStatus: string
): boolean => {
  const allowed = allowedTransitions[currentStatus as B2BSubmissionStatus];

  if (!allowed) {
    return false;
  }

  return allowed.includes(nextStatus as B2BSubmissionStatus);
};