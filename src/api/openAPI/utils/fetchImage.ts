import { client } from '@/api/openAPI/client';

async function fetchImage(contentIds: string[]) {
  const requests = contentIds.map((contentId) =>
    client.get('/detailImage1', {
      params: {
        contentId,
        subImageYN: 'Y',
        numOfRows: '1',
        pageNo: '1',
      },
    }),
  );

  const response = await Promise.all(requests);
  const result = response.map(
    (res) => res.data?.response?.body?.items?.item?.[0]?.originimgurl,
  );

  return result;
}

export { fetchImage };
