export interface Message {
  id: string;
  text: string;
  sender: 'client' | 'operator';
  timestamp: Date;
}

export interface Hint {
  id: string;
  text: string;
  isBestVariant: boolean;
  category: string;
  subcategory: string;
  isExpanded?: boolean;
  score?: number | string;
}

export interface ChatData {
  category: string;
  messages: Message[];
  hints: Hint[];
}

// Тип для ответа API (можно вынести в отдельный файл позже)
interface ApiOption {
  id: number | string;
  score: number;
  payload: {
    'Шаблонный ответ': string;
    'Основная категория': string;
    Подкатегория: string;
    // остальные поля можно игнорировать
  };
}

export interface ApiResponse {
  options: ApiOption[];
  model_answer: number | string;
}

export interface ResponseItem {
  id: number;
  time: string;
  content: ApiResponse;
}
