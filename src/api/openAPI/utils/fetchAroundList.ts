import { AxiosResponse } from 'axios';

import { client } from '@/api/openAPI/client';

interface OpenAPIResponse<T> {
  response: {
    body: {
      items: {
        item: T[];
      };
    };
  };
}

interface detailItem {
  [key: string]: string;
}

interface FetchAroundListParams {
  mapX: number;
  mapY: number;
  contentTypeId?: string;
  radius?: number;
}

export async function fetchAroundList({
  mapX,
  mapY,
  contentTypeId,
  radius = 3000,
}: FetchAroundListParams): Promise<AxiosResponse<OpenAPIResponse<detailItem>>> {
  const response = await client.get(`/locationBasedList1`, {
    params: {
      mapX,
      mapY,
      radius,
      ...(contentTypeId ? { contentTypeId } : {}),
    },
  });

  return response;
}
