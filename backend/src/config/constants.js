export const UPLOAD_STATUS = {
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const MATCH_STATUS = {
  MATCHED: 'Matched',
  PARTIALLY_MATCHED: 'PartiallyMatched',
  NOT_MATCHED: 'NotMatched',
  DUPLICATE: 'Duplicate',
};

export const ROLES = {
  ADMIN: 'Admin',
  ANALYST: 'Analyst',
  VIEWER: 'Viewer',
};

export const ROLE_PERMISSIONS = {
  Admin: ['view', 'upload', 'reconcile', 'audit', 'manage_users'],
  Analyst: ['view', 'upload', 'reconcile', 'audit'],
  Viewer: ['view', 'audit'],
};

export const FILE_TYPES = {
  CSV: 'text/csv',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const MAX_FILE_SIZE = 52428800; // 50MB

export const AUDIT_SOURCES = {
  MANUAL: 'Manual',
  AUTO: 'Auto',
  SYSTEM: 'System',
};

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  UPLOAD: 'UPLOAD',
  RECONCILE: 'RECONCILE',
  CORRECT: 'CORRECT',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
