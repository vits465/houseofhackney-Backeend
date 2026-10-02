import BaseRepository from "../../shared/database/BaseRepository.js";
import UserToken from "./userToken.model.js";
import { USER_TOKEN_POPULATE } from "../../shared/populate/auth.populate.js";

class UserTokenRepository extends BaseRepository {

    constructor() {
        super(UserToken, USER_TOKEN_POPULATE);
    }

// Create Session
    async createSession(sessionData) {
        return this.create(sessionData);
    }

// Find By Refresh Token
    async findByRefreshToken(refreshToken) {

        return this.model
            .findOne({
                refreshToken,
                isRevoked: false,
            })
            .select("+refreshToken")
            .populate(USER_TOKEN_POPULATE);

    }

// Find User Sessions
    async findByUser(userId) {

        return this.findAll({
            user: userId,
            isRevoked: false,
        });

    }

// Find By Device
    async findByDevice(userId, deviceId) {

        return this.findOne({
            user: userId,
            deviceId,
            isRevoked: false,
        });

    }

// Find Active Session
    async findActiveSession(userId, deviceId) {

        return this.findOne({
            user: userId,
            deviceId,
            isRevoked: false,
            expiresAt: {
                $gt: new Date(),
            },
        });

    }

// Revoke Session
    async revokeSession(refreshToken) {

        return this.model.findOneAndUpdate(
            {
                refreshToken,
            },
            {
                isRevoked: true,
                revokedAt: new Date(),
            },
            {
                returnDocument: 'after',
            }
        ).populate(USER_TOKEN_POPULATE);

    }

// Revoke All User Sessions
    async revokeAllSessions(userId) {

        return this.model.updateMany(
            {
                user: userId,
                isRevoked: false,
            },
            {
                isRevoked: true,
                revokedAt: new Date(),
            }
        );

    }

// Update Last Used
    async updateLastUsed(id) {

        return this.update(id, {
            lastUsedAt: new Date(),
        });

    }

// Delete Expired Sessions
    async deleteExpiredSessions() {

        return this.model.deleteMany({
            expiresAt: {
                $lt: new Date(),
            },
        });

    }

// Delete Revoked Sessions
    async deleteRevokedSessions() {

        return this.model.deleteMany({
            isRevoked: true,
        });

    }

// Count Active Sessions
    async countActiveSessions(userId) {

        return this.count({
            user: userId,
            isRevoked: false,
        });

    }

}

export default new UserTokenRepository();