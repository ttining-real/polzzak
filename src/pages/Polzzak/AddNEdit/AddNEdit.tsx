import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { useNavigate, useParams } from 'react-router-dom';

import supabase from '@/api/supabase';
import Button from '@/components/Button/Button';
import CalendarCustom from '@/components/Calendar/CalendarCustom';
import Chip from '@/components/Chip/Chip';
import SlideUpDialog from '@/components/Dialog/SlideUpDialog';
import Icon from '@/components/Icon/Icon';
import { ImageCropper } from '@/components/Input/ImageCropper';
import Input from '@/components/Input/Input';
import Validation from '@/components/Input/Validation';
import Loader from '@/components/Loader/Loader';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/store/useAuthStore';
import { useDialogStore } from '@/store/useDialogStore';

type PolzzakState = {
  name: string | null;
  dateRange: DateRange | null;
  region: string[] | null;
  thumbnail: string | null;
  fileName: string | null;
  imageUrl: string | null;
  thumbnailBlob: Blob | null;
};

const initialPolzzakState: PolzzakState = {
  name: null,
  dateRange: null,
  region: null,
  thumbnail: null,
  fileName: null,
  imageUrl: null,
  thumbnailBlob: null,
};

type PolzzakAction =
  | { type: 'SET_NAME'; payload: string | null }
  | { type: 'SET_DATE_RANGE'; payload: DateRange | null }
  | { type: 'SET_REGION'; payload: string[] }
  | { type: 'TOGGLE_REGION'; payload: string }
  | { type: 'SET_THUMBNAIL'; payload: string | null }
  | { type: 'SET_FILE_NAME'; payload: string | null }
  | { type: 'SET_IMAGE_URL'; payload: string | null }
  | { type: 'SET_THUMBNAIL_BLOB'; payload: Blob | null }
  | { type: 'RESET' };

function polzzakReducer(
  state: PolzzakState,
  action: PolzzakAction,
): PolzzakState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_REGION':
      return { ...state, region: action.payload };
    case 'TOGGLE_REGION': {
      const exists = state.region?.includes(action.payload);
      return {
        ...state,
        region: exists
          ? (state.region?.filter((r) => r !== action.payload) ?? [])
          : [...(state.region ?? []), action.payload],
      };
    }
    case 'SET_THUMBNAIL':
      return { ...state, thumbnail: action.payload };
    case 'SET_FILE_NAME':
      return { ...state, fileName: action.payload };
    case 'SET_IMAGE_URL':
      return { ...state, imageUrl: action.payload };
    case 'SET_THUMBNAIL_BLOB':
      return { ...state, thumbnailBlob: action.payload };
    case 'RESET':
      return initialPolzzakState;
    default:
      return state;
  }
}

function AddNEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditPage = Boolean(id);
  const isAddPage = !isEditPage;
  const [editDate, setEditDate] = useState<DateRange | null>(null);
  const [editRegion, setEditRegion] = useState<string[] | null>();
  const [editFile, setEditFile] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen, openModal, closeModal } = useDialogStore();
  const [state, dispatch] = useReducer(polzzakReducer, initialPolzzakState);
  const inputRef = useRef<HTMLInputElement>(null);
  const getUserId = useAuthStore((state) => state.user);
  const userId = getUserId?.id;
  const showToast = useToast();
  const {
    name,
    dateRange,
    region,
    thumbnail,
    fileName,
    imageUrl,
    thumbnailBlob,
  } = state;

  useEffect(() => {
    if (!userId) {
      navigate('/polzzak', { replace: true });
    }
  }, [userId, navigate]);

  /* 편집 정보 가져오기 */
  const getEditInfo = useCallback(async () => {
    const { data, error } = await supabase
      .from('ex_polzzak')
      .select('*')
      .eq('id', id);

    if (error) {
      showToast(
        '편집할 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
        'bottom-[64px]',
        5000,
      );
      console.error(error);
      return;
    }

    const getEditRegion = async () => {
      const { data: regionData, error: regionErr } = await supabase
        .from('ex_polzzak_region')
        .select('region')
        .eq('polzzak_id', id);

      if (regionErr) {
        showToast(
          '편집할 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
          'bottom-[64px]',
          5000,
        );
        console.error(regionErr);
        return;
      } else if (!regionData || regionData.length === 0) {
        dispatch({ type: 'SET_REGION', payload: [] });
        setEditRegion([]);
      } else {
        const editRegionData = regionData.map((i) => i.region);
        dispatch({ type: 'SET_REGION', payload: editRegionData });
        setEditRegion(editRegionData);
      }
    };

    if (data[0]?.thumbnail) {
      const { data: urlData, error: urlError } = await supabase.storage
        .from('expolzzak')
        .createSignedUrl(data[0].thumbnail, 86400);

      dispatch({
        type: 'SET_FILE_NAME',
        payload: urlError
          ? null
          : (urlData?.signedUrl.split('?')[0].split('/').pop() ?? null),
      });
      setEditFile(data[0].thumbnail);
    }

    dispatch({ type: 'SET_NAME', payload: data[0]?.name ?? null });
    dispatch({
      type: 'SET_DATE_RANGE',
      payload: { from: data[0].startDate, to: data[0]?.endDate ?? null },
    });
    setEditDate({ from: data[0].startDate, to: data[0]?.endDate ?? null });
    dispatch({ type: 'SET_THUMBNAIL', payload: data[0]?.thumbnail ?? null });
    getEditRegion();
  }, [id, showToast]);

  useEffect(() => {
    dispatch({ type: 'RESET' });

    if (isEditPage) {
      getEditInfo();
    }
  }, [isEditPage, getEditInfo]);

  /* 날짜 선택 */
  const handleCalender = () => {
    if (isOpen) {
      closeModal();
    } else {
      openModal();
    }
  };

  const calenderBtn = [
    {
      text: dateRange?.from
        ? dateRange?.to
          ? `${format(dateRange.from, 'yyyy-MM-dd(eee)', { locale: ko })} ~ ${format(dateRange.to, 'yyyy-MM-dd(eee)', { locale: ko })}`
          : `${format(dateRange.from, 'yyyy-MM-dd(eee)', { locale: ko })}`
        : '폴짝 타이밍을 선택해 주세요.',

      onClick: () => {
        closeModal();
      },
    },
    {
      text: '초기화',
      onClick: () => dispatch({ type: 'SET_DATE_RANGE', payload: null }),
    },
  ];

  /* 파일 선택 */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);
    dispatch({ type: 'SET_IMAGE_URL', payload: url });
    dispatch({ type: 'SET_FILE_NAME', payload: file.name });
  };

  const handleCropDone = (blob: Blob) => {
    dispatch({ type: 'SET_THUMBNAIL_BLOB', payload: blob });
    const previewUrl = URL.createObjectURL(blob);
    dispatch({ type: 'SET_THUMBNAIL', payload: previewUrl });
    setShowCropper(false);
  };

  const uploadFileToStorage = async (blob: Blob) => {
    const tempId = crypto.randomUUID();
    const baseName =
      fileName?.split('.')[0]?.replace(/[^\w\-_.]/g, '') ?? 'thumbnail';
    const path = `polzzak/${userId}/${tempId}/${baseName}.webp`;

    const { data, error } = await supabase.storage
      .from('expolzzak')
      .upload(path, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/webp',
      });

    if (error) {
      console.error(error);
      return;
    }

    return data?.path;
  };

  // 저장할 날짜 배열로 변경
  const getDateRangeArray = (start: Date, end: Date) => {
    const result = [];
    const current = new Date(start);
    while (current <= end) {
      result.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  /* 추가하기 */
  const errToast = (text: string) => {
    showToast(
      `폴짝을 ${text}하지 못했어요. 잠시 후 다시 시도해 주세요.`,
      'bottom-[64px]',
      5000,
    );
  };

  const saveAddPolzzak = async () => {
    setIsSaving(true);

    let finalThumbnailPath = null;
    if (thumbnailBlob) {
      finalThumbnailPath = await uploadFileToStorage(thumbnailBlob);
    }
    /* 폴짝 이름 저장 */
    const { data, error } = await supabase
      .from('ex_polzzak')
      .insert([
        {
          user_id: userId,
          name: name || null,
          startDate:
            dateRange?.from &&
            format(dateRange.from, 'yyyy-MM-dd', { locale: ko }),
          endDate: dateRange?.to
            ? format(dateRange.to, 'yyyy-MM-dd', { locale: ko })
            : null,
          thumbnail: finalThumbnailPath ?? null,
        },
      ])
      .select();

    if (error) {
      errToast('추가');
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      errToast('추가');
      console.error(error);
      return;
    }

    const polzzakId = data[0].id;
    try {
      /* 폴짝 날짜 저장 */
      if (dateRange?.from && !dateRange.to) {
        const { error: oneScheduleErr } = await supabase
          .from('ex_polzzak_schedule')
          .insert([
            {
              polzzak_id: polzzakId,
              date: format(dateRange.from, 'yyyy-MM-dd', { locale: ko }),
            },
          ]);

        if (oneScheduleErr) throw oneScheduleErr;
      } else if (dateRange?.from && dateRange?.to) {
        const dateList = getDateRangeArray(
          new Date(dateRange.from),
          new Date(dateRange.to),
        );

        const { error: scheduleErr } = await supabase
          .from('ex_polzzak_schedule')
          .insert(
            dateList.map((date) => ({
              polzzak_id: polzzakId,
              date: format(date, 'yyyy-MM-dd', { locale: ko }),
            })),
          );

        if (scheduleErr) throw scheduleErr;
      }

      /* 폴짝 지역 저장 */
      if (region) {
        const { error: regionErr } = await supabase
          .from('ex_polzzak_region')
          .insert(
            region.map((item) => ({
              polzzak_id: polzzakId,
              region: item,
            })),
          );

        if (regionErr) throw regionErr;
      }

      navigate(`/polzzak/${polzzakId}`, { replace: true });
    } catch (err) {
      errToast('추가');
      console.error('데이터 저장 실패 : ', err);
      if (polzzakId) {
        await supabase.from('ex_polzzak').delete().eq('id', polzzakId);
      }
    } finally {
      setIsSaving(false);
      dispatch({ type: 'RESET' });
    }
  };

  /* 편집 정보 저장 */
  const isSameRegion = (a: string[], b: string[]) => {
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, idx) => val === sortedB[idx]);
  };

  const saveEditPolzzak = async () => {
    setIsSaving(true);

    try {
      let finalThumbnailPath = thumbnail;
      if ((thumbnailBlob || !thumbnail) && editFile) {
        const { data, error } = await supabase.storage
          .from('expolzzak')
          .remove([editFile]);

        if (error || !data) {
          showToast(
            '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
            'bottom-[64px]',
            5000,
          );
          console.error(error);
          return;
        }
      }
      if (thumbnailBlob) {
        finalThumbnailPath = (await uploadFileToStorage(thumbnailBlob)) ?? null;
      }

      const { error } = await supabase
        .from('ex_polzzak')
        .update([
          {
            user_id: userId,
            name: name || null,
            startDate:
              dateRange?.from &&
              format(dateRange.from, 'yyyy-MM-dd', { locale: ko }),
            endDate: dateRange?.to
              ? format(dateRange.to, 'yyyy-MM-dd', { locale: ko })
              : null,
            thumbnail: finalThumbnailPath ?? null,
          },
        ])
        .eq('id', id);

      if (error) {
        showToast(
          '저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
          'bottom-[64px]',
          5000,
        );
        console.error(error);
        return;
      }

      if (
        dateRange?.from !== editDate?.from ||
        dateRange?.to !== editDate?.to
      ) {
        const formatDate = (d: Date) => format(d, 'yyyy-MM-dd', { locale: ko });

        const oldDates =
          editDate?.from && editDate?.to
            ? getDateRangeArray(
                new Date(editDate.from),
                new Date(editDate.to),
              ).map(formatDate)
            : editDate?.from
              ? [formatDate(new Date(editDate.from))]
              : [];

        const newDates =
          dateRange?.from && dateRange?.to
            ? getDateRangeArray(
                new Date(dateRange.from),
                new Date(dateRange.to),
              ).map(formatDate)
            : dateRange?.from
              ? [formatDate(new Date(dateRange.from))]
              : [];

        const toInsert = newDates.filter((d) => !oldDates.includes(d));
        const toDelete = oldDates.filter((d) => !newDates.includes(d));

        if (toDelete.length > 0) {
          const { error: deleteScheduleErr } = await supabase
            .from('ex_polzzak_schedule')
            .delete()
            .in('date', toDelete)
            .eq('polzzak_id', id);
          if (deleteScheduleErr) throw deleteScheduleErr;
        }
        // // 추가: 새로 생긴 날짜는 schedule만 insert
        if (toInsert.length > 0) {
          const { error: insertScheduleErr } = await supabase
            .from('ex_polzzak_schedule')
            .insert(
              toInsert.map((date) => ({
                polzzak_id: id,
                date,
              })),
            );
          if (insertScheduleErr) throw insertScheduleErr;
        }
      }

      let changeRegion = false;
      if (region?.length) {
        if (editRegion?.length) {
          changeRegion = !isSameRegion(region, editRegion);
        }
        if (changeRegion) {
          const { error: deleteErr } = await supabase
            .from('ex_polzzak_region')
            .delete()
            .eq('polzzak_id', id);

          if (deleteErr) throw deleteErr;
        }

        const { error: insertErr } = await supabase
          .from('ex_polzzak_region')
          .insert(
            region.map((item) => ({
              polzzak_id: id,
              region: item,
            })),
          );

        if (insertErr) throw insertErr;
      } else {
        if (editRegion?.length) {
          const { error: deleteErr } = await supabase
            .from('ex_polzzak_region')
            .delete()
            .eq('polzzak_id', id);

          if (deleteErr) throw deleteErr;
        }
      }
      navigate(-1);
    } catch (err) {
      errToast('저장');
      console.error('데이터 저장 실패 : ', err);
    } finally {
      setIsSaving(false);
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <section className="flex flex-col justify-between gap-10">
      <h1 className="sr-only">폴짝 추가하기</h1>
      <div className="flex flex-1 flex-col gap-4">
        <div>
          <Input
            label="폴짝 이름"
            type="text"
            placeholder="폴짝 이름을 입력해 주세요."
            value={name ?? ''}
            onChange={(e) =>
              dispatch({ type: 'SET_NAME', payload: e.target.value })
            }
            maxLength={20}
          />
        </div>
        <div>
          <Input
            label="폴짝 날짜"
            type="button"
            value={
              dateRange?.from
                ? dateRange?.to
                  ? `${format(dateRange.from, 'yyyy-MM-dd', { locale: ko })} ~ ${format(dateRange.to, 'yyyy-MM-dd', { locale: ko })}`
                  : `${format(dateRange.from, 'yyyy-MM-dd', { locale: ko })}`
                : '폴짝 타이밍을 선택해 주세요.'
            }
            onClick={handleCalender}
            className={dateRange?.from && 'text-black'}
          >
            <Button variant={'tertiary'} size="md" onClick={handleCalender}>
              <Icon id="calendar" className="text-gray05" />
            </Button>
          </Input>
          {!dateRange?.from && (
            <Validation status={false} message="필수 입력 항목입니다." />
          )}
        </div>
        <div>
          <Chip
            mode="region"
            label="지역 선택"
            subLabel="다중 선택 가능합니다."
            type="multiple"
            onClick={(selectChip) =>
              dispatch({ type: 'TOGGLE_REGION', payload: selectChip.name })
            }
            selectedValues={region}
          />
        </div>
        <div>
          <Input
            label="폴짝 사진"
            type="file"
            placeholder="폴짝 사진을 등록해 주세요."
            onClick={() => setShowCropper(true)}
            onChange={handleFileChange}
            ref={inputRef}
            thumbnail={thumbnail}
            fileName={fileName}
          >
            {thumbnail && (
              <Button
                variant="input"
                onClick={() => {
                  dispatch({ type: 'SET_THUMBNAIL', payload: null });
                  dispatch({ type: 'SET_FILE_NAME', payload: null });
                  dispatch({ type: 'SET_IMAGE_URL', payload: null });
                  dispatch({ type: 'SET_THUMBNAIL_BLOB', payload: null });
                }}
                className="text-gray07 ml-1"
              >
                <Icon id="close" className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant={'tertiary'}
              size="md"
              onClick={() => {
                inputRef.current?.click();
              }}
            >
              <Icon id="image" className="text-gray05" />
            </Button>
          </Input>
        </div>

        {thumbnail && imageUrl && (
          <figure>
            <figcaption className="fs-14 m-1 px-1">
              폴짝 사진 미리보기
            </figcaption>
            <img
              src={thumbnail}
              alt="선택한 폴짝 사진 미리보기"
              className="w-1/2 rounded-lg border drop-shadow-md"
            />
          </figure>
        )}
      </div>
      <Button
        disabled={isSaving || !dateRange?.from}
        onClick={async () => {
          if (!userId) {
            navigate('/polzzak', { replace: true });
            return;
          }

          if (isAddPage) {
            await saveAddPolzzak();
          } else {
            await saveEditPolzzak();
          }
        }}
      >
        {isAddPage ? '폴짝 추가하기' : '폴짝 저장하기'}
      </Button>
      {isOpen && (
        <SlideUpDialog
          header="폴짝 날짜 선택"
          button={calenderBtn}
          buttonDirection="col"
        >
          <CalendarCustom
            selected={dateRange ?? undefined}
            onSelect={(range) =>
              dispatch({ type: 'SET_DATE_RANGE', payload: range ?? null })
            }
          />
        </SlideUpDialog>
      )}
      {showCropper && imageUrl && (
        <ImageCropper imageUrl={imageUrl} onCropDone={handleCropDone} />
      )}
      {isSaving && <Loader text="폴짝 저장 중..." />}
    </section>
  );
}

export default AddNEdit;
