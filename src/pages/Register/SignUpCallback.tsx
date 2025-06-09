import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import supabase from '@/api/supabase';

export default function SignUpCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('이메일 인증을 처리 중입니다...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setMessage('❌ 사용자 인증에 실패했습니다.');
        console.error('인증된 사용자 정보를 가져오지 못했습니다.', error);
        return;
      }

      const nickname = localStorage.getItem('register_nickname');
      const phone = localStorage.getItem('register_phone');

      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        nickname,
        phone_number: phone,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        setMessage('❌ 사용자 정보 저장에 실패했습니다.');
        console.error('users 테이블 삽입 실패', insertError.message);
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
  }, []);

  return (
    <div className="flex h-screen items-center justify-center text-center">
      <p className="text-lg">{message}</p>
    </div>
  );
}
