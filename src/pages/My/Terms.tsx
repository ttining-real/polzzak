function Terms() {
  const sectionStyle = 'fs-14 px-4 py-2';
  const headingStyle = 'fs-16 font-semibold';

  return (
    <main className="h-full w-full flex-1 overflow-auto p-6">
      <h2 className="fs-30 mb-6 text-center font-bold">폴짝 서비스 이용약관</h2>

      <div className="bg-gray02 flex flex-col gap-4 rounded-md">
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제1장 (목적)</h3>
          <p>
            이 약관은 사용자가 정보 공공 API를 이용한 여행 서비스 "폴짝" (이하
            "여행 서비스")를 이용함에 있어, 이용조건, 절차, 권리 및 의무 등을
            명확히 정하고 이를 보호하기 위한 목적으로 합니다.
          </p>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제2장 (용어의 정의)</h3>
          <ul>
            <li>
              - 회사 : 폴짝 서비스를 계약과 기호에 따라 개발 및 관리하는 주체
            </li>
            <li>- 이용자 : 이 약관에 따라 서비스를 이용하는 사람</li>
            <li>
              - 회원 : 서비스에 회원가입을 하고, 회원기능을 이용할 수 있는
              이용자
            </li>
          </ul>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제3장 (약관의 가호 및 변경)</h3>
          <p>
            회사는 서비스 운영상 필요에 따라 이 약관을 개정할 수 있으며, 개정된
            내용은 적용일자와 함께 공지사항을 통해 안내됩니다.
          </p>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제4장 (서비스의 제공)</h3>
          <ul>
            <p>
              회사는 전국 여행지, 건물, 음식점, 숙소 등의 정보를 추천하는
              서비스를 제공합니다.
            </p>
            <p>
              비회원도 홈, 지도 사용 및 검색이 가능하며, 로그인 후 즐겨찾기
              저장, 폴짝 일정 설정, 리뷰 기능을 이용할 수 있습니다.
            </p>
          </ul>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제5장 (이용자의 의미)</h3>
          <ul>
            <p>
              이용자는 일정 설정에서 정한 시간에 따라 장소 정보를 입력, 편집,
              저장할 수 있으며, 지도 검색 및 표시가 가능합니다.
            </p>
            <p>
              일반 서비스는 비회원 이용이 가능하며, 즐겨찾기, 폴짝, 리뷰 기능은
              로그인이 필요합니다.
            </p>
          </ul>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제6장 (경고 및 가정의 제한)</h3>
          <ul>
            <li>- 불쾌하거나 차별적인 표현</li>
            <li>- 타인의 권리 침해</li>
            <li>- 경제적 피해를 야기하는 행위 등</li>
          </ul>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>
            제7장 (캠핑과 정책 및 게임에 관한 정보)
          </h3>
          <p>
            서비스 내 모든 콘텐츠는 공공 API의 정책을 기반으로 하며, 이미지 또는
            데이터가 다운로드되지 않을 수 있습니다. 이에 대한 책임은 회사에
            없습니다.
          </p>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제8장 (책임의 제한)</h3>
          <p>
            회사는 서비스의 구성이나 기능 변경 시 책임을 지지 않으며, 관련
            사항은 서비스 내 공지로 안내됩니다.
          </p>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제9장 (보존 및 기타)</h3>
          <p>
            회사는 이용자의 개인정보를 보호할 책임이 있으며, 필요 시 관련 공지를
            사전에 안내합니다.
          </p>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제10장 (탈퇴 및 데이터 삭제)</h3>
          <ul>
            <p>
              회원은 언제든지 ‘My &gt; 편집 &gt; 탈퇴하기’를 통해 탈퇴가
              가능합니다.
            </p>
            <p>
              탈퇴 즉시 모든 계정 정보 및 즐겨찾기, 폴짝 일정, 리뷰 등 데이터가
              즉시 삭제되며 복구는 불가합니다.
            </p>
          </ul>
        </section>
        <section className={sectionStyle}>
          <h3 className={headingStyle}>제11장 (관할 법원)</h3>
          <p>
            본 약관은 대한민국 법률에 따르며, 분쟁 발생 시 관할 법원은
            서울중앙지방법원으로 합니다.
          </p>
        </section>
      </div>
    </main>
  );
}

export default Terms;
