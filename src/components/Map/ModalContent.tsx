import ListItemCardById from '@/components/ListItem/ListItemCardById';
import { MarkerDataTypes } from '@/types/mapDataType';

interface ModalContentProps {
  data?: MarkerDataTypes[];
  contentId?: string;
}

export default function ModalContent({ data, contentId }: ModalContentProps) {
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
                  currentTitle={item.title}
                />
              ),
          )}
        </ul>
      )}
      {contentId && <p>{contentId}</p>}
    </>
  );
}
