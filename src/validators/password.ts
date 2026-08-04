const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_RULES = [
  { regex: /[a-z]/, msg: "una letra minúscula" },
  { regex: /[A-Z]/, msg: "una letra mayúscula" },
  { regex: /[0-9]/, msg: "un número" },
];

export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`;
  }
  const missing = PASSWORD_RULES.filter((r) => !r.regex.test(password)).map((r) => r.msg);
  if (missing.length > 0) {
    return `La contraseña debe contener al menos: ${missing.join(", ")}`;
  }
  return null;
}
