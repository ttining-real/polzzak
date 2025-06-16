/**
 * 닉네임 유효성 검사 함수
 * @param nickname 검사할 닉네임 문자열
 * @returns 메시지와 유효성 결과
 */
export function validateNickname(nickname: string): {
  isValid: boolean;
  message: string;
} {
  const trimmed = nickname.trim();

  // ✅ 공백 검사 (앞뒤 공백 제거 후 비교)
  if (trimmed.length !== nickname.length || /\s/.test(nickname)) {
    return { isValid: false, message: '공백은 사용할 수 없습니다.' };
  }

  // ✅ 형식 검사 (한글, 영문, 숫자만 허용)
  const regex = /^[가-힣a-zA-Z0-9]{2,10}$/;
  if (!regex.test(nickname)) {
    return {
      isValid: false,
      message: '2~10자의 한글, 영문, 숫자로 입력해 주세요.',
    };
  }

  // ✅ 통과
  return { isValid: true, message: '' };
}
