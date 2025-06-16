export function getRandomNickname(): string {
  const adjectives = [
    '귀여운',
    '상큼한',
    '섹시한',
    '심심한',
    '말랑한',
    '도도한',
    '느긋한',
    '배고픈',
    '밝은',
    '포근한',
    '조용한',
    '똑똑한',
    '몽글한',
    '쫀득한',
    '기분좋은',
  ];

  const nouns = [
    '토끼',
    '다람쥐',
    '고양이',
    '강아지',
    '햄스터',
    '곰돌이',
    '펭귄',
    '너구리',
    '고슴도치',
    '수달',
    '용',
    '오리',
    '병아리',
  ];

  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    const nickname = `${adj}${noun}`;
    if (nickname.length >= 2 && nickname.length <= 10) {
      return nickname;
    }
  }

  // fallback: 가능한 조합 중 길이 2~10자인 것만 무작위 선택
  const validCombinations = adjectives.flatMap((adj) =>
    nouns
      .map((noun) => `${adj}${noun}`)
      .filter((name) => name.length >= 2 && name.length <= 10),
  );

  if (validCombinations.length > 0) {
    return validCombinations[
      Math.floor(Math.random() * validCombinations.length)
    ];
  }

  // 최종 fallback: "폴짝" + 4자리 숫자 (항상 6글자 보장)
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 1000~9999
  return `폴짝${randomNum}`;
}
