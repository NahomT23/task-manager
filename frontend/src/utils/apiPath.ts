export const BASE_URL = "http://localhost:3000";

export const API_PATHS = {
  AUTH: {
    SIGN_UP: '/api/auth/sign-up',
    SIGN_IN: '/api/auth/sign-in',
    GET_PROFILE: '/api/auth/profile',
    UPDATE_PROFILE : '/api/auth/profile'
  },
  ORGANIZATIONS: {
    CREATE: '/api/org/create',
    GENERATE_INVITATION: '/api/org/generate-invitation',
    JOIN: '/api/org/join',
  },
  REPORTS: {
    EXPORT_TASKS: '/api/reports/export/tasks',
    EXPORT_USERS: '/api/reports/export/users',
  },
  TASKS: {
    DASHBOARD_DATA: '/api/tasks/dashboard-data',
    USER_DASHBOARD_DATA: '/api/tasks/user-dashboard-data',
    GET_ALL_TASKS: '/api/tasks',
    GET_TASK_BY_ID: (taskId: string) => `/api/tasks/${taskId}`,
    CREATE_TASK: '/api/tasks',
    UPDATE_TASK: (taskId: string) => `/api/tasks/${taskId}`,
    DELETE_TASK: (taskId: string) => `/api/tasks/${taskId}`,
    UPDATE_TASK_STATUS: (taskId: string) => `/api/tasks/${taskId}/status`,
    UPDATE_TODO_CHECKLIST: (taskId: string) => `/api/tasks/${taskId}/todo`,
  },
  USERS: {
    GET_ALL_USERS: '/api/users',
    GET_USER_BY_ID: (userId: string) => `/api/users/${userId}`,
    DELETE_USER: (userId: string) => `/api/users/${userId}`,
  },
};
