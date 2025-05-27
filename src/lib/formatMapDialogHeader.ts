import { typeToRenderText } from '@/lib/filterMap';

export const formatMapDialogHeader = (type: string): string | undefined => {
  return typeToRenderText(type);
};
