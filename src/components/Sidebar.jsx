import { Menu, MessageSquare, Plus, Trash2 } from "lucide-react";

function Sidebar({
  isOpen,
  onToggle,
  chats,
  currentChatIndex,
  onChatSelect,
  onNewChat,
  onDeleteChat,
}) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getChatTitle = (chat, index) => {
    if (chat.title) return chat.title;
    const firstMessage = chat.messages[0]?.content || "";
    if (firstMessage.length > 30) {
      return firstMessage.substring(0, 30) + "...";
    }
    return firstMessage || "New Chat";
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-500 to-blue-500">
            <div className="flex items-center gap-2">
              <Menu className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Chat History</h2>
            </div>
            <button
              onClick={onNewChat}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              title="New Chat"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No chat history yet</p>
                <p className="text-sm">Start a new conversation!</p>
              </div>
            ) : (
              <div className="p-2">
                {chats.map((chat, index) => (
                  <div
                    key={index}
                    className={`group relative p-3 mb-1 rounded-lg cursor-pointer transition-colors ${
                      currentChatIndex === index
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                    onClick={() => onChatSelect(index)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {getChatTitle(chat, index)}
                          </p>
                          <p
                            className={`text-xs mt-0.5 ${
                              currentChatIndex === index
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            {formatDate(chat.timestamp)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(index);
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
                          currentChatIndex === index
                            ? "hover:bg-white/20"
                            : "hover:bg-gray-200"
                        }`}
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Chat</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
