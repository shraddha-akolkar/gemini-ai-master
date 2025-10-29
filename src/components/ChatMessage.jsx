import { Sparkles, User } from "lucide-react";

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 mb-6 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`flex gap-3 max-w-[80%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "bg-white text-gray-900 border border-gray-200 shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
