import Button from '@/components/Button/Button';

function Tabmenu({ data, currentTab, onClickTab }) {
  if (!data || !data.length) return;
  return (
    <ul className="flex">
      {data.map((tab) => (
        <li
          key={tab}
          className={`flex-1 ${currentTab === tab && 'border-primary border-b-2'}`}
        >
          <Button
            variant={'tertiary'}
            onClick={() => {
              onClickTab(tab);
            }}
            className={`${currentTab === tab ? 'font-bold' : 'text-gray06 font-regular'} fs-14 w-full`}
          >
            {tab}
          </Button>
        </li>
      ))}
    </ul>
  );
}
export default Tabmenu;
