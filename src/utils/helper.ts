export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isDisabled(
  agree: { value: boolean },
  email: string,
  name: string
): boolean {
  return !agree.value || !isValidEmail(email) || name.length === 0;
}
