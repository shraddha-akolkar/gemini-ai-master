import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Menu, LogIn } from "lucide-react";
import ChatMessage from "./components/ChatMessage";
import Sidebar from "./components/Sidebar";
import LoginModal from "./components/LoginModal";
import { getGeminiResponse } from "./services/geminiService";
import { saveChatsToStorage, loadChatsFromStorage } from "./utils/storage";

function App() {
  const [chats, setChats] = useState([]);
  const [currentChatIndex, setCurrentChatIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024
  );
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = loadChatsFromStorage();
    if (savedChats.length > 0) {
      setChats(savedChats);
      setMessages(savedChats[0].messages || []);
    } else {
      // Create initial chat
      const initialChat = {
        id: `chat-${Date.now()}`,
        title: "",
        messages: [],
        timestamp: Date.now(),
      };
      setChats([initialChat]);
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      saveChatsToStorage(chats);
    }
  }, [chats]);

  // Update messages when current chat changes
  useEffect(() => {
    if (
      chats.length > 0 &&
      currentChatIndex >= 0 &&
      currentChatIndex < chats.length
    ) {
      setMessages(chats[currentChatIndex].messages || []);
    }
  }, [currentChatIndex, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getGeminiResponse(input, messages);
      const aiMessage = { role: "assistant", content: response };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);

      // Update the current chat with new messages
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const currentChat = { ...updatedChats[currentChatIndex] };

        // Generate title from first user message if title is empty
        if (!currentChat.title && updatedMessages.length > 0) {
          const firstUserMessage = updatedMessages.find(
            (msg) => msg.role === "user"
          );
          if (firstUserMessage) {
            const titleText = firstUserMessage.content;
            currentChat.title =
              titleText.length > 40
                ? titleText.substring(0, 40) + "..."
                : titleText;
          }
        }

        currentChat.messages = finalMessages;
        currentChat.lastUpdated = Date.now();
        updatedChats[currentChatIndex] = currentChat;
        return updatedChats;
      });
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please check your API key in the .env file.",
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);

      // Save error message to chat
      setChats((prevChats) => {
        const updatedChats = [...prevChats];
        const currentChat = { ...updatedChats[currentChatIndex] };
        currentChat.messages = finalMessages;
        currentChat.lastUpdated = Date.now();
        updatedChats[currentChatIndex] = currentChat;
        return updatedChats;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: "",
      messages: [],
      timestamp: Date.now(),
    };
    setChats([newChat, ...chats]);
    setCurrentChatIndex(0);
    setMessages([]);
    setInput("");
  };

  const handleChatSelect = (index) => {
    setCurrentChatIndex(index);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleDeleteChat = (index) => {
    if (chats.length === 1) {
      // If this is the only chat, just clear its messages
      const clearedChat = { ...chats[0], messages: [], title: "" };
      setChats([clearedChat]);
      setMessages([]);
    } else {
      const updatedChats = chats.filter((_, i) => i !== index);
      setChats(updatedChats);

      // Adjust current index
      if (index === currentChatIndex) {
        setCurrentChatIndex(0);
      } else if (index < currentChatIndex) {
        setCurrentChatIndex(currentChatIndex - 1);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        chats={chats}
        currentChatIndex={currentChatIndex}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-80">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-800">
                Gemini Clone
              </h1>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Login</span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-2xl mb-4">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Welcome to Gemini Clone
                </h2>
                <p className="text-gray-600 mb-8 max-w-md">
                  Start a conversation by typing a message below. Ask me
                  anything!
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Explain quantum computing",
                    "Write a poem about the ocean",
                    "How do neural networks work?",
                    "Give me recipe ideas",
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 py-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Gemini..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white text-gray-900 placeholder-gray-500"
                  style={{
                    maxHeight: "200px",
                    minHeight: "52px",
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Gemini can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default App;
