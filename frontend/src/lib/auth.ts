import { useStore } from '../store/useStore';

export const auth = {
  // Check if we have user info
  async getCurrentUser() {
    await useStore.getState().fetchUser();
    return useStore.getState().user;
  },

  // Perform email login
  async login(email: string, passwordHashRaw: string): Promise<boolean> {
    try {
      await useStore.getState().login(email, passwordHashRaw);
      return true;
    } catch (err) {
      throw err;
    }
  },

  // Perform logout
  async logout(): Promise<boolean> {
    try {
      await useStore.getState().logout();
      return true;
    } catch {
      return false;
    }
  },

  // Trigger silent refresh or check session validity
  async refreshSession(): Promise<boolean> {
    return useStore.getState().refreshSession();
  },

  // Revoke device session
  async revokeSession(sessionId: string): Promise<boolean> {
    return useStore.getState().revokeSession(sessionId);
  },

  // Revoke all device sessions
  async revokeAllSessions(): Promise<boolean> {
    return useStore.getState().revokeAllSessions();
  },

  // Fetch all active sessions
  async getActiveSessions(): Promise<any[]> {
    return useStore.getState().getActiveSessions();
  }
};
