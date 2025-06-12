import supabase from '@/api/supabase';

export async function updateNickname(inputNickname: string) {
  // > localStorage 또는 sessionStorage에서 사용자ID 가져오기
  const USER_EMAIL = localStorage.getItem('user');

  if (!USER_EMAIL) {
    console.error('해당 USER의 ID가 존재하지 않습니다.');
    return false;
  }

  // > 현재 사용자 정보 확인
  const { data: USER_DATA, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', USER_EMAIL)
    .single();

  if (!USER_DATA || fetchError) {
    console.error(fetchError, '사용자 정보를 가져오는 데 실패했습니다.');
    return false;
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({ nickname: inputNickname })
    .eq('email', USER_EMAIL);

  if (updateError) {
    console.error(
      '닉네임 저장 실패:',
      updateError.message,
      updateError.details,
    );
    return false;
  }

  return true;
}
