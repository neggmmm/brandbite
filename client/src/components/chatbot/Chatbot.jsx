import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleChatbot,
  addLocalMessage,
  clearSuggestions,
  checkChatbotHealth,
  sendChatMessage,
  resetChatSession,
  clearChat,
  loadChatHistory,
  setWelcomeMessage,
} from "../../redux/slices/chatbotSlice";
import { useSettings } from "../../context/SettingContext";
import "./Chatbot.css";

// Helper to parse message content with Markdown support
const MessageParser = ({ content, type }) => {
  if (type === "user") {
    return <div className="bubble text-bubble">{content}</div>;
  }

  const lines = content.split("\n");
  const blocks = [];
  let currentBlock = null;

  const flushBlock = () => {
    if (currentBlock) {
      blocks.push(currentBlock);
      currentBlock = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBlock();
      return;
    }

    // Check for Markdown Image ![alt](url)
    const mdImgRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
    const mdImgMatch = line.match(mdImgRegex);
    if (mdImgMatch) {
      flushBlock();
      const textBefore = line.substring(0, mdImgMatch.index).trim();
      const textAfter = line.substring(mdImgMatch.index + mdImgMatch[0].length).trim();
      if (textBefore) {
        blocks.push({ type: "text", content: textBefore });
      }
      blocks.push({ type: "image", url: mdImgMatch[2], alt: mdImgMatch[1] });
      if (textAfter) {
        blocks.push({ type: "text", content: textAfter });
      }
      return;
    }

    // Check for List Item
    if (trimmed.match(/^[-*]\s/) || trimmed.match(/^\d+\.\s/)) {
      if (!currentBlock || currentBlock.type !== "list") {
        flushBlock();
        currentBlock = { type: "list", items: [] };
      }
      currentBlock.items.push(trimmed.replace(/^[-*\d.]+\s*/, ""));
      return;
    }

    // Default to Text
    if (!currentBlock || currentBlock.type !== "text") {
      flushBlock();
      currentBlock = { type: "text", content: line };
    } else {
      currentBlock.content += "\n" + line;
    }
  });
  flushBlock();

  const renderInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="bubble bot-content-card">
      {blocks.map((block, idx) => {
        if (block.type === "text") {
          return (
            <p key={idx} className="content-text">
              {renderInline(block.content)}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={idx} className="content-list">
              {block.items.map((item, i) => (
                <li key={i}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.type === "image") {
          return (
            <div key={idx} className="content-image-wrapper">
              <img
                src={block.url}
                alt={block.alt || "Content"}
                className="content-image"
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default function Chatbot() {
  const dispatch = useDispatch();
  const { settings } = useSettings();
  const { isActive, isWaiting, messages, suggestions, conversationState, isLoaded } =
    useSelector((s) => s.chatbot);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  
  const [input, setInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [prevAuth, setPrevAuth] = useState(isAuthenticated);
  const messagesRef = useRef(null);

  // Restaurant info from settings
  const restaurantName = settings?.restaurantName || "Our Restaurant";
  const logoUrl = settings?.branding?.logoUrl || "/images/bot-logo.png";

  const timeString = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  // Initial load - check health
  useEffect(() => {
    dispatch(checkChatbotHealth());
  }, [dispatch]);

  // Load chat history when chatbot opens or auth changes
  useEffect(() => {
    if (isActive && !isLoaded) {
      dispatch(loadChatHistory()).then((result) => {
        // If no history loaded, show welcome message
        if (!result.payload?.messages?.length) {
          dispatch(setWelcomeMessage(restaurantName));
        }
      });
    }
  }, [isActive, isLoaded, dispatch, restaurantName]);

  // Handle logout - clear chat when user logs out
  useEffect(() => {
    if (prevAuth && !isAuthenticated) {
      // User just logged out
      dispatch(clearChat());
    }
    setPrevAuth(isAuthenticated);
  }, [isAuthenticated, prevAuth, dispatch]);

  // Handle login - reload chat history when user logs in
  useEffect(() => {
    if (!prevAuth && isAuthenticated && isActive) {
      // User just logged in while chatbot is open
      dispatch(loadChatHistory()).then((result) => {
        if (!result.payload?.messages?.length) {
          dispatch(setWelcomeMessage(restaurantName));
        }
      });
    }
  }, [isAuthenticated, prevAuth, isActive, dispatch, restaurantName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, suggestions, isWaiting]);

  const onToggle = () => {
    dispatch(toggleChatbot());
    setShowMenu(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || isWaiting) return;

    dispatch(
      addLocalMessage({
        type: "user",
        content: message,
        time: new Date().toISOString(),
      })
    );

    setInput("");
    dispatch(clearSuggestions());
    dispatch(sendChatMessage(message));
  };

  const onSuggestionClick = (query) => {
    dispatch(
      addLocalMessage({
        type: "user",
        content: query,
        time: new Date().toISOString(),
      })
    );
    dispatch(clearSuggestions());
    dispatch(sendChatMessage(query));
  };

  const onResetChat = () => {
    dispatch(resetChatSession());
    setShowMenu(false);
  };

  const typingIndicator = useMemo(() => {
    if (!isWaiting) return null;
    return (
      <div className="message bot-message">
        <div className="typing-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>
    );
  }, [isWaiting]);

  return (
    <div
      className={`chatbot-container lg:mx-10 ${isActive ? "active" : ""}`}
      id="chatbot"
    >
      <div className="chatbot-window">
        <div className="chatbot-header">
          <div className="bot-avatar">
            <img
              src={logoUrl}
              alt={restaurantName}
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
          <div className="header-info">
            <h3>{restaurantName}</h3>
            <p>
              <span className="status-dot"></span>
              Online • {conversationState || "greeting"}
            </p>
          </div>
          
          {/* Menu Button */}
          <div className="header-menu">
            <button
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Options"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            {showMenu && (
              <div className="menu-dropdown">
                <button onClick={onResetChat}>🔄 New Conversation</button>
              </div>
            )}
          </div>

          <button className="header-close-btn" onClick={onToggle}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="chatbot-messages" id="chatMessages" ref={messagesRef}>
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.type}-message`}>
              <div className="message-content-wrapper">
                <MessageParser content={m.content} type={m.type} />
                <span className="message-time">{timeString()}</span>
              </div>
            </div>
          ))}

          {typingIndicator}

          {suggestions && suggestions.length > 0 && (
            <div className="suggestion-buttons">
              {suggestions.map((s, i) => (
                <button
                  type="button"
                  className="suggestion-btn"
                  key={i}
                  onClick={() => onSuggestionClick(s.query)}
                >
                  {s.text}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chatbot-input-area">
          <form className="input-wrapper" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Type your message..."
              aria-label="Type your message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isWaiting}
              dir="auto"
            />
            <button
              type="submit"
              className="send-btn"
              aria-label="Send message"
              disabled={!input.trim() || isWaiting}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>

      <button
        className="chatbot-toggle"
        aria-label="Toggle chatbot"
        aria-expanded={isActive}
        onClick={onToggle}
      >
        <span className="toggle-icon chat-icon" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </span>
        <span className="toggle-icon close-icon" aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>
      </button>
    </div>
  );
}
