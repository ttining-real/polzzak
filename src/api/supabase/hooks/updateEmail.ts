import supabase from '@/api/supabase';

export const updateEmail = async (newEmail: string) => {
  try {
    const CURRENT_LOGINED_EMAIL = localStorage.getItem('user');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !CURRENT_LOGINED_EMAIL) {
      console.error('유저 정보를 가져올 수 없습니다.:', userError);
      return false;
    }

    if (user.email === CURRENT_LOGINED_EMAIL) {
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (updateError) {
        console.error('이메일 업데이트 실패:', updateError);
        return false;
      }

      const { error: dbUpdateError } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('email', CURRENT_LOGINED_EMAIL);
      if (dbUpdateError) {
        console.error('users 테이블 이메일 업데이트 실패:', dbUpdateError);
        return false;
      }

      return true;
    }
  } catch (err) {
    console.error('이메일 업데이트 예외 발생:', err);
    return false;
  }
};
