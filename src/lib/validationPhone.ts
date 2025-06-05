/**
 * 입력된 숫자 문자열을 000-0000-0000 형식으로 변환
 * 숫자 이외의 문자는 제거
 * 최대 11자리까지만 처리하며, 초과되는 숫자는 무시
 */
export function validationPhone(input: string): string {
  const num = input.replace(/[^0-9]/g, '').slice(0, 11);

  if (num.length < 4) {
    return num;
  } else if (num.length < 8) {
    return `${num.slice(0, 3)}-${num.slice(3)}`;
  } else {
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7)}`;
  }
}
