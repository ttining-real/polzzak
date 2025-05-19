import ListItemCardById from '@/components/ListItem/ListItemCardById';
import { DetailCommonDataType } from '@/types/detailCommonDataType';

interface ModalContentProps {
  data?: DetailCommonDataType[];
  contentId?: string;
}

export default function ModalContent({ data, contentId }: ModalContentProps) {
  // console.log(data);

  return (
    <>
      {data && (
        <ul className="flex flex-col gap-4">
          {data?.map(
            (item) =>
              item.contentid &&
              item.contenttypeid && (
                <ListItemCardById
                  key={item.contentid}
                  contentId={item.contentid}
                  contentTypeId={item.contenttypeid}
                />
              ),
          )}
        </ul>
      )}
      {contentId && <p>{contentId}</p>}
    </>
  );
}
