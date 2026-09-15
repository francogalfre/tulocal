const ONE_MINUTE_IN_SECONDS = 60;
const SOCIAL_SIGN_IN_ATTEMPTS_PER_MINUTE = 10;
const OAUTH_CALLBACKS_PER_MINUTE = 10;
const SESSION_READS_PER_MINUTE = 120;

export const rateLimitRules = {
  "/sign-in/social": { window: ONE_MINUTE_IN_SECONDS, max: SOCIAL_SIGN_IN_ATTEMPTS_PER_MINUTE },
  "/callback/google": { window: ONE_MINUTE_IN_SECONDS, max: OAUTH_CALLBACKS_PER_MINUTE },
  "/get-session": { window: ONE_MINUTE_IN_SECONDS, max: SESSION_READS_PER_MINUTE },
};
