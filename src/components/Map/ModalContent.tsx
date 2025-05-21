import ListItemCardById from '@/components/ListItem/ListItemCardById';
import { MakerDataTypes } from '@/types/mapDataType';

interface ModalContentProps {
  data?: MakerDataTypes[];
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
                />
              ),
          )}
        </ul>
      )}
      {contentId && <p>{contentId}</p>}
    </>
  );
}
