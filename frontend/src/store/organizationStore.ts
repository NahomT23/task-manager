import { create } from 'zustand';

interface OrganizationState {
  orgName: string;
  setOrgName: (name: string) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  orgName: '',
  setOrgName: (name: string) => set({ orgName: name }),
}));