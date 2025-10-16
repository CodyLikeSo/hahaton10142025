import { ResponseItem } from '@/interface';
import { FC } from 'react';

interface Props {
  responseData: ResponseItem[];
}

/** Создал компоненту для отображения данных в терминале */
export const ChatTerminal: FC<Props> = ({ responseData }) => {
  console.log(responseData);
  return (
    <>
      {responseData.map((item) => (
        <div key={item.id}>
          <div className="text-base font-bold">{item.time}</div>
          <pre className="text-xs text-black whitespace-pre-wrap">
            <code>{JSON.stringify(item.content, null, 2)}</code>
          </pre>
        </div>
      ))}
    </>
  );
};
