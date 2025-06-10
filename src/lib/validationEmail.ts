export function validateEmail(email: string) {
  const trimmed = email.trim();
  const isValid =
    trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

  return {
    isValid,
    message: isValid ? '' : '올바른 이메일 형식을 입력해 주세요.',
  };
}
