import { ResponseItem } from '@/interface';
import { FC } from 'react';

interface Props {
  responseData: ResponseItem[];
}

/** Создал компоненту для отображения данных в терминале */
export const ChatTerminal: FC<Props> = ({ responseData }) => {
  return (
    <>
      {responseData.map((item) => (
        <pre key={item.id} className="text-[9px] text-gray-300 whitespace-pre-wrap font-mono">
          <code>{`[${item.time}]: ${JSON.stringify(item.content, null, 2)}`}</code>
        </pre>
      ))}
    </>
  );
};