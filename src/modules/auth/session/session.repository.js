import BaseRepository from "../../../shared/database/BaseRepository.js";
import Session from "./session.model.js";
import { SESSION_POPULATE } from "../../../shared/populate/auth.populate.js";

class SessionRepository extends BaseRepository {
  constructor() {
    super(Session, SESSION_POPULATE);
  }

  async findActiveByRefreshTokenHash(refreshTokenHash) {
    return this.findOne({
      refreshTokenHash,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });
  }

  async findActiveSessionsByUserId(userId) {
    return this.findAll({
      user: userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }, null, { sort: { lastUsedAt: -1 } });
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
    ).populate(SESSION_POPULATE);
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
