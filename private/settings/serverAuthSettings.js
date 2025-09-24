module.exports = {
  AUTH_COOKIE_NAME: "authenticated",
  ACCESS_DENIED_MESSAGE: "access denied: need to be authenticated.",
  LOGIN_ENDPOINT: "/api/v1/login",
  LOGOUT_ENDPOINT: "/api/v1/logout",
  AUTH_POST_ENDPOINT: "/api/v1/auth",
  LOGIN_REDIRECT_PATH: "/",
  LOGOUT_REDIRECT_PATH: "/",
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "password",
  USERNAME_PASSWORD_REQUIRED_MESSAGE: "Username and password are required",
  AUTHENTICATION_SUCCESS_MESSAGE: "Authentication successful",
  INVALID_CREDENTIALS_MESSAGE: "Invalid credentials",
  RATE_LIMIT_EXCEEDED_MESSAGE:
    "Too many login attempts. Please try again later.",
  IP_RESET_LOG_MESSAGE: (ip) => `Login attempts for IP ${ip} reset.`,
  ALL_RESET_LOG_MESSAGE: "All login attempts reset.",
};
