import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';

export default function SignUpCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('이메일 인증을 처리 중입니다...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      // 해시 파라미터에서 에러 확인
      const hashParams = new URLSearchParams(location.hash.substring(1));
      if (hashParams.get('error')) {
        const errorDescription =
          hashParams.get('error_description') ||
          '알 수 없는 오류가 발생했습니다.';
        setMessage(`❌ 인증 오류: ${decodeURIComponent(errorDescription)}`);
        console.error('인증 오류', errorDescription);
        return;
      }

      // 현재 로그인된 사용자 정보 얻기 (자동으로 세션 인식된 상태일 것)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage('❌ 사용자 인증에 실패했습니다.');
        console.error('인증된 사용자 정보를 가져오지 못했습니다.', userError);
        return;
      }

      // 로컬 저장소에서 추가 정보 불러오기
      const nickname = localStorage.getItem('register_nickname');
      const phone = localStorage.getItem('register_phone');

      const { error: upsertError } = await supabase.from('users').upsert(
        {
          id: user.id,
          email: user.email,
          nickname,
          phone_number: phone,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (upsertError) {
        setMessage('❌ 사용자 정보 저장에 실패했습니다.');
        console.error('users 테이블 upsert 실패', upsertError.message);
        return;
      }

      setMessage(
        `${nickname}님, 인증이 완료되었습니다! 로그인 화면으로 이동합니다.`,
      );

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="flex h-screen items-center justify-center px-4 text-center">
      <p className="text-lg">{message}</p>
    </div>
  );
}
