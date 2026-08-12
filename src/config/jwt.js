const jwtConfig = {
    accessSecret: process.env.JWT_ACCESS_SECRET?.trim() || "house_of_hackney_jwt_access_secret_key_2026_super_secure_key",
    refreshSecret: process.env.JWT_REFRESH_SECRET?.trim() || "house_of_hackney_jwt_refresh_secret_key_2026_super_secure_key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN?.trim() || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN?.trim() || "7d",
};

export default jwtConfig;