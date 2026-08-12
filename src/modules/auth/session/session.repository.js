import BaseRepository from "../../../shared/database/BaseRepository.js";
import Session from "./session.model.js";

class SessionRepository extends BaseRepository {
  constructor() {
    super(Session);
  }

  async findActiveByRefreshTokenHash(refreshTokenHash) {
    return this.model.findOne({
      refreshTokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async findActiveSessionsByUserId(userId) {
    return this.model
      .find({
        user: userId,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      })
      .sort({ lastUsedAt: -1 });
  }

  async revokeSessionById(sessionId, revokedBy = null) {
    return this.model.findByIdAndUpdate(
      sessionId,
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy,
      },
      { new: true }
    );
  }

  async revokeAllUserSessions(userId, revokedBy = null) {
    return this.model.updateMany(
      {
        user: userId,
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy,
      }
    );
  }

  async revokeOtherUserSessions(userId, currentSessionId, revokedBy = null) {
    return this.model.updateMany(
      {
        user: userId,
        _id: { $ne: currentSessionId },
        isRevoked: false,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy,
      }
    );
  }
}

export default new SessionRepository();
