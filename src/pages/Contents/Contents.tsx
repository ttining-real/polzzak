import { Outlet } from 'react-router-dom';

function Contents() {
  return (
    <main className="no-scrollbar flex flex-1 flex-col gap-4 overflow-auto">
      <Outlet />

      <cite className="text-gray06 bg-gray01 fs-13 ls lh p-6 text-center">
        ※ 한국관광공사 TourAPI 4.0을 통해 제공받은 데이터 입니다.
      </cite>
    </main>
  );
}

export default Contents;
