import { ResponseItem } from '@/interface';
import { FC } from 'react';

interface Props {
  responseData: ResponseItem[];
}

export const ChatTerminal: FC<Props> = ({ responseData }) => {
  return (
    <>
      {responseData.map((item) => (
        <pre key={item.id} className="text-[12px] text-black! whitespace-pre-wrap font-mono">
          <code>{`[${item.time}]: ${JSON.stringify(item.content, null, 2)}`}</code>
        </pre>
      ))}
    </>
  );
};