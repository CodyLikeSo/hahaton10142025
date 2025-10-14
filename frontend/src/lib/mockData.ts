export interface Message {
  id: string;
  text: string;
  sender: 'client' | 'operator';
  timestamp: Date;
}

export interface Hint {
  id: string;
  text: string;
  isExpanded?: boolean;
}

export interface ChatData {
  category: string;
  messages: Message[];
  hints: Hint[];
}

export const mockChatData: ChatData = {
  category: "Technical Support",
  messages: [
    {
      id: "1",
      text: "Hi, I'm having trouble with my account login. It keeps saying my password is incorrect.",
      sender: "client",
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    },
    {
      id: "2",
      text: "Hello! I'd be happy to help you with your login issue. Let me check your account status.",
      sender: "operator",
      timestamp: new Date(Date.now() - 1000 * 60 * 9), // 9 minutes ago
    },
    {
      id: "3",
      text: "I've tried resetting my password multiple times but I'm not receiving the reset email.",
      sender: "client",
      timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
    },
    {
      id: "4",
      text: "I can see your account is active. Let me help you troubleshoot the email delivery issue. Can you check your spam folder first?",
      sender: "operator",
      timestamp: new Date(Date.now() - 1000 * 60 * 7), // 7 minutes ago
    },
    {
      id: "5",
      text: "Yes, I checked spam and it's not there either. This is really frustrating.",
      sender: "client",
      timestamp: new Date(Date.now() - 1000 * 60 * 6), // 6 minutes ago
    },
  ],
  hints: [
    {
      id: "h1",
      text: "I understand your frustration. Let me help you resolve this login issue quickly. I can see your account is active and I'll work with you to get this sorted out.",
    },
    {
      id: "h2",
      text: "Let's try a different approach. I can manually reset your password and send it to an alternative email address if you have one on file.",
    },
    {
      id: "h3",
      text: "I apologize for the inconvenience. Sometimes our automated emails can be delayed or filtered. Let me check if there are any technical issues on our end that might be preventing the reset emails from being delivered to your inbox.",
    },
    {
      id: "h4",
      text: "I can see that your account was created recently. Sometimes new accounts have additional verification steps. Let me walk you through the complete password reset process step by step to ensure we don't miss anything.",
    },
    {
      id: "h5",
      text: "For security purposes, I'll need to verify your identity before proceeding with the password reset. Can you please provide me with the last four digits of the phone number associated with your account?",
    },
  ],
};
