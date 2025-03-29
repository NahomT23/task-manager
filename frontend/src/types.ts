// src/types/index.ts
export type User = {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member' | 'idle';
    profileImageUrl?: string;
    organization?: string;
  };