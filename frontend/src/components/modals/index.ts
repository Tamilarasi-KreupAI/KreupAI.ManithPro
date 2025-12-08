// ============================================================
// MODAL COMPONENTS - Barrel Export
// ============================================================

// Base Modal
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Drawer,
} from './Modal';

export type {
  ModalSize,
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  DrawerPosition,
  DrawerProps,
} from './Modal';

// Confirmation Modals
export {
  ConfirmationModal,
  DeleteConfirmation,
  DiscardChangesModal,
  AlertModal,
  PromptModal,
} from './ConfirmationModal';

export type {
  ConfirmationType,
  ConfirmationModalProps,
  DeleteConfirmationProps,
  DiscardChangesModalProps,
  AlertModalProps,
  PromptModalProps,
} from './ConfirmationModal';

// Form Modals
export {
  FormModal,
  WizardModal,
  DetailModal,
  LoadingModal,
} from './FormModal';

export type {
  FormModalProps,
  WizardStep,
  WizardModalProps,
  DetailField,
  DetailModalProps,
  LoadingModalProps,
} from './FormModal';
