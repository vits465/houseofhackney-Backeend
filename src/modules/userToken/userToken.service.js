import sessionService from "../auth/session/session.service.js";

class UserTokenService {
  async createSession(sessionData) {
    return sessionService.createSession(sessionData);
  }

  async validateRefreshToken(refreshToken) {
    return sessionService.verifyActiveSession(refreshToken);
  }

  async revokeSession(refreshToken) {
    const session = await sessionService.verifyActiveSession(refreshToken);
    return sessionService.revokeSession(session._id);
  }

  async revokeAllSessions(userId) {
    return sessionService.revokeAllUserSessions(userId);
  }

  async getActiveSessions(userId) {
    return sessionService.getUserSessions(userId);
  }
}

export default new UserTokenService();