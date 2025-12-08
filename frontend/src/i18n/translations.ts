// ============================================================
// TRANSLATIONS - All locale translations
// ============================================================

import { en } from './en';
import type { Locale } from './index';

// Re-export English as base type
export type { TranslationKeys } from './en';

// Placeholder translations for other locales
// In production, these would be complete translations
const createPlaceholder = (locale: string) => ({
  ...en,
  common: {
    ...en.common,
    // Add locale-specific overrides here
  },
});

// Spanish (placeholder - would have full translations)
export const es = {
  ...en,
  common: {
    ...en.common,
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar',
    yes: 'Sí',
    no: 'No',
  },
  auth: {
    ...en.auth,
    signIn: 'Iniciar Sesión',
    signOut: 'Cerrar Sesión',
    signUp: 'Registrarse',
    email: 'Correo Electrónico',
    password: 'Contraseña',
  },
  nav: {
    ...en.nav,
    home: 'Inicio',
    dashboard: 'Panel',
    jobs: 'Empleos',
    settings: 'Configuración',
  },
};

// French (placeholder)
export const fr = {
  ...en,
  common: {
    ...en.common,
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    yes: 'Oui',
    no: 'Non',
  },
  auth: {
    ...en.auth,
    signIn: 'Se Connecter',
    signOut: 'Se Déconnecter',
    signUp: "S'inscrire",
    email: 'Email',
    password: 'Mot de passe',
  },
  nav: {
    ...en.nav,
    home: 'Accueil',
    dashboard: 'Tableau de Bord',
    jobs: 'Emplois',
    settings: 'Paramètres',
  },
};

// German (placeholder)
export const de = {
  ...en,
  common: {
    ...en.common,
    loading: 'Laden...',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    create: 'Erstellen',
    search: 'Suchen',
    yes: 'Ja',
    no: 'Nein',
  },
  auth: {
    ...en.auth,
    signIn: 'Anmelden',
    signOut: 'Abmelden',
    signUp: 'Registrieren',
    email: 'E-Mail',
    password: 'Passwort',
  },
  nav: {
    ...en.nav,
    home: 'Startseite',
    dashboard: 'Dashboard',
    jobs: 'Jobs',
    settings: 'Einstellungen',
  },
};

// Portuguese (placeholder)
export const pt = {
  ...en,
  common: {
    ...en.common,
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    search: 'Pesquisar',
    yes: 'Sim',
    no: 'Não',
  },
  auth: {
    ...en.auth,
    signIn: 'Entrar',
    signOut: 'Sair',
    signUp: 'Cadastrar',
    email: 'Email',
    password: 'Senha',
  },
};

// Japanese (placeholder)
export const ja = {
  ...en,
  common: {
    ...en.common,
    loading: '読み込み中...',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    create: '作成',
    search: '検索',
    yes: 'はい',
    no: 'いいえ',
  },
  auth: {
    ...en.auth,
    signIn: 'ログイン',
    signOut: 'ログアウト',
    signUp: '新規登録',
    email: 'メール',
    password: 'パスワード',
  },
};

// Chinese (placeholder)
export const zh = {
  ...en,
  common: {
    ...en.common,
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    search: '搜索',
    yes: '是',
    no: '否',
  },
  auth: {
    ...en.auth,
    signIn: '登录',
    signOut: '退出',
    signUp: '注册',
    email: '邮箱',
    password: '密码',
  },
};

// All translations
export const translations: Record<Locale, typeof en> = {
  en,
  es,
  fr,
  de,
  pt,
  ja,
  zh,
};

export default translations;
