import { Loader } from 'lucide-react';
import { FC } from 'react';

//* добавил лоадер */
export const Loading: FC = () => {
  return (
    <div className="flex items-center justify-center mb-2 gap-2">
      <p className="text-base text-gray-400 mt-1">AI is thinking </p>
      <Loader className="animate-spin text-white w-6 h-6" />
    </div>
  );
};
