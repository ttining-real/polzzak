import { useToastStore } from '@/store/useToastStore';

function Toast() {
  const { message, position } = useToastStore();

  if (!message) return null;

  return (
    <div
      className={`fixed left-1/2 z-10 flex -translate-x-[50%] items-center gap-4 rounded-md bg-black/75 px-4 py-2 ${position} z-[999]`}
    >
      <p className="font-regular fs-14 whitespace-nowrap text-white">
        {message}
      </p>
    </div>
  );
}

export default Toast;
