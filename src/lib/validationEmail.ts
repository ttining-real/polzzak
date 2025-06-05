export const validEmail = (email: string): boolean => {
  // 이메일 전체 정규식
  const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // 공백이 있는 경우는 무조건 false
  if (/\s/.test(email)) return false;

  return emailRegex.test(email);
};
