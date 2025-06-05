/**
 * 아이디 유효성 검사 함수
 * @param id 검사할 아이디 문자열
 * @returns 메시지와 유효성 결과
 */

export function validateId(id: string): { isValid: boolean; message: string } {
  const trimmed = id.trim();

  // ✅ 공백 검사 (앞뒤 공백 제거 후 길이 비교로 체크)
  if (trimmed.length !== id.length || /\s/.test(id)) {
    return { isValid: false, message: '공백은 사용할 수 없습니다.' };
  }

  // ✅ 형식 검사 (영문, 숫자, 6~20자)
  const regex = /^[a-zA-Z0-9]{6,20}$/;
  if (!regex.test(id)) {
    return {
      isValid: false,
      message: '6~20자의 영문, 숫자로 입력하세요. (대소문자 구분 없음)',
    };
  }

  // ✅ 통과
  return { isValid: true, message: '사용 가능한 아이디입니다.' };
}
