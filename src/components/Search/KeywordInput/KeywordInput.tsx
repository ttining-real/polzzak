import { useCallback } from 'react';

import Button from '@/components/Button/Button';
import Icon from '@/components/Icon/Icon';
import Input from '@/components/Input/Input';
import { useSearchStore } from '@/store/useSearchStore';

function KeywordInput() {
  const keyword = useSearchStore((state) => state.keyword);
  const setKeyWord = useSearchStore((state) => state.setKeyWord);

  const handleKeyword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyWord(e.target.value);
    },
    [setKeyWord],
  );

  return (
    <div>
      <Input
        label="검색"
        hideLabel={true}
        type="text"
        placeholder="검색어를 입력해 주세요."
        value={keyword}
        onChange={handleKeyword}
      >
        <Button variant={'tertiary'} size="md">
          <Icon id="search" className="text-gray05" />
        </Button>
      </Input>
    </div>
  );
}

export default KeywordInput;
