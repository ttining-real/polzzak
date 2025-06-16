export function validateEmail(emailId: string = '', emailDomain: string = '') {
  const trimmedId = emailId?.trim();
  const trimmedDomain = emailDomain?.trim();

  if (!trimmedId && !trimmedDomain) {
    return {
      isValid: false,
      message: '이메일 아이디와 도메인을 입력해 주세요.',
    };
  }

  if (!trimmedId) {
    return {
      isValid: false,
      message: '이메일 아이디를 입력해 주세요.',
    };
  }

  if (!trimmedDomain) {
    return {
      isValid: false,
      message: '이메일 도메인을 입력해 주세요.',
    };
  }

  const fullEmail = `${trimmedId}@${trimmedDomain}`;
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail);

  return {
    isValid,
    message: isValid ? '' : '올바른 이메일 형식을 입력해 주세요.',
  };
}
