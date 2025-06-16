/**
 * 비밀번호 유효성 검사 함수
 * @param password 검사할 비밀번호 문자열
 * @returns 메시지와 유효성 결과
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  const trimmed = password.trim();

  // ✅ 공백 검사 (앞뒤 공백 또는 중간 공백 포함)
  if (trimmed.length !== password.length || /\s/.test(password)) {
    return { isValid: false, message: '공백은 사용할 수 없습니다.' };
  }

  // ✅ 형식 검사 (영문 + 숫자 + 특수문자, 8~20자)
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~])[A-Za-z\d!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]{8,20}$/;

  if (!regex.test(password)) {
    return {
      isValid: false,
      message: '영문과 숫자, 특수문자를 포함하여 8~20자여야 합니다.',
    };
  }

  // ✅ 통과
  return { isValid: true, message: '사용 가능한 비밀번호입니다.' };
}
