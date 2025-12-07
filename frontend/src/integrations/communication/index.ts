// ============================================================
// COMMUNICATION MODULE - Communication service exports
// ============================================================

export {
  EmailService,
  EMAIL_TEMPLATES,
  type EmailTemplate,
  type EmailTemplateCategory,
} from './EmailService';

export {
  SMSService,
  SMS_TEMPLATES,
  type SMSTemplate,
  type SMSTemplateCategory,
} from './SMSService';

export {
  SlackService,
  type SlackChannel,
  type SlackUser,
} from './SlackService';
