import { AxiosResponse } from 'axios';

import { client } from '@/api/openAPI/client';

interface FetchAroundListParams {
  mapX: number;
  mapY: number;
  radius?: number;
}

export async function fetchAroundList({
  mapX,
  mapY,
  radius = 3000,
}: FetchAroundListParams): Promise<AxiosResponse<any>> {
  const response = await client.get(`/locationBasedList1`, {
    params: {
      mapX,
      mapY,
      radius,
    },
  });

  return response;
}
