import { MESSAGES, Language, MessageKey } from '../constants/messages';

export function getMessage(key: MessageKey, language: Language = 'en', params?: Record<string, string | number>): string {
  let message = MESSAGES[language][key] || MESSAGES.en[key] || key;
  
  // Replace parameters in message
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      message = message.replace(`{${paramKey}}`, String(value));
    });
  }
  
  return message;
}

export function getSuccessMessage(key: MessageKey, language: Language = 'en', params?: Record<string, string | number>) {
  return {
    success: true,
    message: getMessage(key, language, params)
  };
}

export function getErrorMessage(key: MessageKey, language: Language = 'en', params?: Record<string, string | number>) {
  return {
    success: false,
    message: getMessage(key, language, params)
  };
}
