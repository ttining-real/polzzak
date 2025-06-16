import { client } from '@/api/openAPI/client';

async function fetchGetDetailCommon(contentId: string) {
  try {
    const res = await client.get('/detailCommon2', {
      params: {
        pageNo: '1',
        numOfRows: '1',
        contentId: contentId,
      },
    });
    const items = res.data?.response?.body?.items?.item ?? [];
    return items[0];
  } catch (err) {
    console.error(err);
    return {};
  }
}

export { fetchGetDetailCommon };
