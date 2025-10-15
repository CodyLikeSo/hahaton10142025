import { ChatData } from '@/interface';

export const mockChatData: ChatData = {
  category: 'Technical Support',
  messages: [
    {
      id: '1',
      text: "Hi, I'm having trouble with my account login. It keeps saying my password is incorrect.",
      sender: 'client',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    },
    {
      id: '2',
      text: "Hello! I'd be happy to help you with your login issue. Let me check your account status.",
      sender: 'operator',
      timestamp: new Date(Date.now() - 1000 * 60 * 9), // 9 minutes ago
    },
    {
      id: '3',
      text: "I've tried resetting my password multiple times but I'm not receiving the reset email.",
      sender: 'client',
      timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    },
    {
      id: '4',
      text: 'I can see your account is active. Let me help you troubleshoot the email delivery issue. Can you check your spam folder first?',
      sender: 'operator',
      timestamp: new Date(Date.now() - 1000 * 60 * 7), // 7 minutes ago
    },
    {
      id: '5',
      text: "Yes, I checked spam and it's not there either. This is really frustrating.",
      sender: 'client',
      timestamp: new Date(Date.now() - 1000 * 60 * 6), // 6 minutes ago
    },
  ],
  hints: [
    {
      id: 'h1',
      text: "I understand your frustration. Let me help you resolve this login issue quickly. I can see your account is active and I'll work with you to get this sorted out.",
    },
    {
      id: 'h2',
      text: "Let's try a different approach. I can manually reset your password and send it to an alternative email address if you have one on file.",
    },
    {
      id: 'h3',
      text: 'I apologize for the inconvenience. Sometimes our automated emails can be delayed or filtered. Let me check if there are any technical issues on our end that might be preventing the reset emails from being delivered to your inbox.',
    },
    {
      id: 'h4',
      text: "I can see that your account was created recently. Sometimes new accounts have additional verification steps. Let me walk you through the complete password reset process step by step to ensure we don't miss anything.",
    },
    {
      id: 'h5',
      text: "For security purposes, I'll need to verify your identity before proceeding with the password reset. Can you please provide me with the last four digits of the phone number associated with your account?",
    },
  ],
};

/** данные получение от сервера */
export const mockDataResponse = {
  options: [
    {
      id: 14694719292036810058,
      score: 0.74549407,
      payload: {
        'Основная категория': 'Продукты - Кредиты',
        Подкатегория: 'Онлайн кредиты - Проще в онлайн',
        'Пример вопроса': 'Как оформить онлайн кредит?',
        Приоритет: 'высокий',
        'Целевая аудитория': 'новые клиенты',
        'Шаблонный ответ':
          'Онлайн кредит можно оформить через сайт vtb.by или мобильное приложение VTB mBank, заполнив заявку и загрузив необходимые документы.',
      },
    },
    {
      id: 15780951019625324266,
      score: 0.67924374,
      payload: {
        'Основная категория': 'Продукты - Кредиты',
        Подкатегория: 'Потребительские - На всё про всё',
        'Пример вопроса': 'Какие документы нужны для кредита?',
        Приоритет: 'высокий',
        'Целевая аудитория': 'новые клиенты',
        'Шаблонный ответ':
          'Для оформления кредита необходим паспорт, при необходимости - справка о доходах и документы, подтверждающие цель кредита.',
      },
    },
    {
      id: 4530043503554907571,
      score: 0.67484045,
      payload: {
        'Основная категория': 'Продукты - Кредиты',
        Подкатегория: 'Потребительские - Дальше - меньше',
        'Пример вопроса': 'Можно ли оформить онлайн?',
        Приоритет: 'высокий',
        'Целевая аудитория': 'новые клиенты',
        'Шаблонный ответ':
          'Заявку на кредит можно подать онлайн через сайт банка, но для окончательного оформления потребуется визит в отделение.',
      },
    },
    {
      id: 931157799525874807,
      score: 0.67439747,
      payload: {
        'Основная категория': 'Продукты - Кредиты',
        Подкатегория: 'Потребительские - Всё только начинается',
        'Пример вопроса': 'Кто может оформить этот кредит?',
        Приоритет: 'высокий',
        'Целевая аудитория': 'новые клиенты',
        'Шаблонный ответ':
          "Кредит 'Всё только начинается' предназначен для клиентов старше 50 лет и предоставляет особые льготные условия.",
      },
    },
    {
      id: 17567665241177566367,
      score: 0.6572578,
      payload: {
        'Основная категория': 'Частные клиенты',
        Подкатегория: 'Кредиты',
        'Пример вопроса': 'Можно ли получить кредит онлайн?',
        Приоритет: 'средний',
        'Целевая аудитория': 'все клиенты',
        'Шаблонный ответ':
          'Банк ВТБ (Беларусь) предлагает онлайн-оформление потребительского кредита, универсальной карточки рассрочки Черепаха, кредитной карты Портмоне 2.0 или PLAT/ON. Доступная сумма кредитного лимита будет рассчитываться исходя из дохода и действующих кредитов/рассрочек. Окончательное решение принимается после оформления заявки в интернет-банке / мобильном приложении VTB Online.',
      },
    },
  ],
  model_answer: 14694719292036810058,
};
