const STORAGE_KEY = "gemini-chat-history";

export const saveChatsToStorage = (chats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error("Error saving chats to localStorage:", error);
  }
};

export const loadChatsFromStorage = () => {
  try {
    const chats = localStorage.getItem(STORAGE_KEY);
    return chats ? JSON.parse(chats) : [];
  } catch (error) {
    console.error("Error loading chats from localStorage:", error);
    return [];
  }
};

export const generateChatId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
