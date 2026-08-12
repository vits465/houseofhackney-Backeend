import sessionRepository from "./session.repository.js";
import tokenService from "../token/token.service.js";
import AppError from "../../../shared/errors/AppError.js";

class SessionService {
  async createSession(sessionData) {
    const { refreshToken, ...rest } = sessionData;
    const refreshTokenHash = tokenService.hashToken(refreshToken);
    const expiresAt = rest.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    return sessionRepository.create({
      ...rest,
      refreshTokenHash,
      expiresAt,
    });
  }

  async verifyActiveSession(refreshToken) {
    if (!refreshToken) {
      throw new AppError("Refresh token is required.", 400);
    }
    const refreshTokenHash = tokenService.hashToken(refreshToken);
    const session = await sessionRepository.findActiveByRefreshTokenHash(refreshTokenHash);

    if (!session) {
      throw new AppError("Invalid or expired session. Please log in again.", 401);
    }

    session.lastUsedAt = new Date();
    await session.save();
    return session;
  }

  async validateSession(refreshToken) {
    return sessionRepository.findActiveByRefreshTokenHash(tokenService.hashToken(refreshToken));
  }

  async getActiveUserSessions(userId) {
    return sessionRepository.findActiveSessionsByUserId(userId);
  }

  async getUserSessions(userId) {
    return sessionRepository.findActiveSessionsByUserId(userId);
  }

  async revokeSessionById(sessionId, revokedBy = null) {
    return sessionRepository.revokeSessionById(sessionId, revokedBy);
  }

  async revokeSession(sessionId, revokedBy = null) {
    return sessionRepository.revokeSessionById(sessionId, revokedBy);
  }

  async revokeAllUserSessions(userId, revokedBy = null) {
    return sessionRepository.revokeAllUserSessions(userId, revokedBy);
  }

  async revokeOtherUserSessions(userId, currentSessionId, revokedBy = null) {
    return sessionRepository.revokeOtherUserSessions(userId, currentSessionId, revokedBy);
  }

  async revokeSessionByToken(refreshToken) {
    try {
      const refreshTokenHash = tokenService.hashToken(refreshToken);
      const session = await sessionRepository.findActiveByRefreshTokenHash(refreshTokenHash);
      if (session) {
        return await sessionRepository.revokeSessionById(session._id);
      }
    } catch (err) {
      return null;
    }
  }

  async revokeOtherSessions(userId, currentRefreshToken) {
    try {
      const refreshTokenHash = tokenService.hashToken(currentRefreshToken);
      const session = await sessionRepository.findActiveByRefreshTokenHash(refreshTokenHash);
      if (session) {
        return await sessionRepository.revokeOtherUserSessions(userId, session._id);
      }
    } catch (err) {
      return await sessionRepository.revokeAllUserSessions(userId);
    }
  }

  async updateSessionToken(sessionId, newRefreshToken) {
    const refreshTokenHash = tokenService.hashToken(newRefreshToken);
    return sessionRepository.update(sessionId, { refreshTokenHash, lastUsedAt: new Date() });
  }
}

export default new SessionService();
