export const AUTH_ERRORS = {
  USER_ALREADY_REGISTERED:
    "An account with this email already exists. Try signing in instead.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  WEAK_PASSWORD: "Password must be at least 6 characters long.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  FULL_NAME_REQUIRED: "Please enter your full name.",
  PASSWORD_REQUIRED: "Please enter a password.",
  EMAIL_REQUIRED: "Please enter your email address.",
  UNEXPECTED: "Something went wrong. Please try again.",
} as const;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
