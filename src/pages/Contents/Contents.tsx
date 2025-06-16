import { Outlet } from 'react-router-dom';

function Contents() {
  return (
    <main className="no-scrollbar flex flex-1 flex-col gap-4 overflow-auto">
      <Outlet />
    </main>
  );
}

export default Contents;
