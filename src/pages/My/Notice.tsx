const noticeList = [
  {
    id: 0,
    title: '서비스 오픈',
    content: [
      '폴짝! 드디어 서비스를 오픈했어요!',
      '저희와 함께 폴짝 뛰어보아요!',
    ],
  },
  {
    id: 1,
    title: '서비스 점검',
    content: [
      '더 나은 폴짝이 되도록 2025년 6월 15일에 서비스 점검이 시작돼요!',
      '점검이 끝난 후 다시 만나요~',
      <br key="br1" />,
      '점검 날짜: 2025년 6월 15일',
      '점검 시간: 00:00 ~ 23:59',
    ],
  },
];

function Notice() {
  return (
    <main className="flex h-full w-full flex-1 flex-col overflow-auto p-6">
      <h2 className="fs-30 m-4 text-center font-bold">
        폴짝 고객센터 공지사항
      </h2>
      <section className="flex flex-col gap-4">
        {noticeList.map((notice) => (
          <details key={notice.id} className="relative">
            <summary className="fs-14 cursor-pointer border-b-2 p-2 font-semibold">
              {notice.title}
            </summary>
            <div className="fs-13 bg-gray02 lh absolute z-99 w-full rounded-b-md px-4 py-2">
              {notice.content.map((p) => (
                <p>{p}</p>
              ))}
            </div>
          </details>
        ))}
      </section>
    </main>
  );
}

export default Notice;
