
import React, { useEffect, useRef, useState } from "react";

const API_BASE_URL = (
  process.env.REACT_APP_API_URL ||
  "https://eventza-backend-7uxv.onrender.com/api"
).replace(/\/+$/, "");

const getChatEndpoint = () => {
  try {
    const savedUser =
      localStorage.getItem("loggedInUser") ||
      localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    return String(user?.role).toLowerCase() === "admin"
      ? `${API_BASE_URL}/ai/admin-chat`
      : `${API_BASE_URL}/ai/user-chat`;
  } catch {
    return `${API_BASE_URL}/ai/user-chat`;
  }
};

const WELCOME_MESSAGE = {
  role: "assistant",
  text: "👋 Welcome to Eventzaa! I am your AI assistant. Ask me anything about Eventzaa, events, registration, bookings, payments or general knowledge.",
};

const isOldMenuMessage = (text = "") => {
  const value = String(text).toLowerCase();

  return (
    value.includes("i can help you with:") ||
    value.includes("try asking: how many users logged in today?")
  );
};

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open && !loading) {
      inputRef.current?.focus();
    }
  }, [open, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || loading) return;

    if (text.length > 2000) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Please keep your message under 2000 characters.",
        },
      ]);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text },
        {
          role: "assistant",
          text: "Please login first to use Eventzaa AI.",
        },
      ]);

      setMessage("");
      return;
    }

    // Exclude old fixed-menu replies and welcome messages.
    const previousMessages = messages
      .filter((item) => ["user", "assistant"].includes(item.role))
      .filter((item) => item.text?.trim())
      .filter((item) => !isOldMenuMessage(item.text))
      .filter((item) => item.text !== WELCOME_MESSAGE.text)
      .slice(-8)
      .map((item) => ({
        role: item.role === "assistant" ? "model" : "user",
        content: item.text,
      }));

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(getChatEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          history: previousMessages,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from Eventzaa server."
        );
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Your login session has expired. Please login again."
          );
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to use this chatbot."
          );
        }

        throw new Error(
          data.message ||
            data.error ||
            `Chatbot request failed. HTTP ${response.status}`
        );
      }

      const aiReply =
        [data.reply, data.answer, data.response].find(
          (reply) => typeof reply === "string" && reply.trim()
        ) ||
        data.candidates
          ?.flatMap((candidate) => candidate.content?.parts || [])
          .map((part) => part.text)
          .filter((part) => typeof part === "string" && part.trim())
          .join("\n");

      if (!aiReply || typeof aiReply !== "string") {
        throw new Error(
          "AI response is empty. Please check your Gemini backend."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: aiReply,
        },
      ]);
    } catch (error) {
      console.error("Eventzaa chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            error.message ||
            "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (loading) return;

    setMessages([WELCOME_MESSAGE]);
    setMessage("");
  };

  return (
    <>
      <style>{`
        .eventzaa-ai-button {
          position: fixed;
          right: 25px;
          bottom: 25px;
          width: 65px;
          height: 65px;
          border: 3px solid #ded8ff;
          border-radius: 50%;
          background: linear-gradient(135deg, #1769ff, #6737ed);
          color: white;
          font-size: 30px;
          cursor: pointer;
          z-index: 99999;
          box-shadow: 0 8px 30px #5745ff55;
          transition: transform .2s ease;
        }

        .eventzaa-ai-button:hover {
          transform: scale(1.07);
        }

        .eventzaa-ai-window {
          position: fixed;
          right: 25px;
          bottom: 105px;
          width: 390px;
          height: min(600px, calc(100dvh - 130px));
          background: white;
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 99998;
          box-shadow: 0 15px 50px #17255435;
          font-family: Arial, sans-serif;
        }

        .eventzaa-ai-header {
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          background: linear-gradient(120deg, #1769ff, #7950f5);
        }

        .eventzaa-ai-avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #e9eaff;
          flex-shrink: 0;
          font-size: 20px;
        }

        .eventzaa-ai-header .eventzaa-ai-avatar {
          background: #ffffff30;
        }

        .eventzaa-ai-heading {
          flex: 1;
          min-width: 0;
          font-size: 17px;
          font-weight: bold;
        }

        .eventzaa-ai-subtitle {
          font-size: 12px;
          margin-top: 4px;
          font-weight: normal;
        }

        .eventzaa-ai-close {
          background: transparent;
          border: 0;
          color: white;
          font-size: 25px;
          cursor: pointer;
        }

        .eventzaa-ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: 18px 12px;
          background: #f8f9ff;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .eventzaa-ai-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .eventzaa-ai-row.user {
          justify-content: flex-end;
        }

        .eventzaa-ai-bubble {
          max-width: 82%;
          padding: 12px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .eventzaa-ai-row:not(.user) .eventzaa-ai-bubble {
          background: #e9edf7;
          color: #192746;
          border-top-left-radius: 4px;
        }

        .eventzaa-ai-row.user .eventzaa-ai-bubble {
          color: white;
          background: linear-gradient(135deg, #2865ff, #5848f5);
          border-top-right-radius: 4px;
        }

        .eventzaa-ai-typing {
          color: #64748b;
          font-size: 13px;
          padding: 5px 10px;
        }

        .eventzaa-ai-footer {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid #eceef6;
          background: white;
        }

        .eventzaa-ai-input {
          flex: 1;
          min-width: 0;
          height: 44px;
          padding: 0 14px;
          border: 1px solid #dddfee;
          border-radius: 25px;
          outline: none;
          font-size: 14px;
        }

        .eventzaa-ai-input:focus {
          border-color: #6557f5;
        }

        .eventzaa-ai-send {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border: 0;
          border-radius: 50%;
          color: white;
          background: linear-gradient(135deg, #1769ff, #6744f5);
          cursor: pointer;
          font-size: 19px;
        }

        .eventzaa-ai-send:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .eventzaa-ai-clear {
          background: transparent;
          border: 1px solid #ffffff80;
          color: white;
          padding: 5px 9px;
          border-radius: 15px;
          font-size: 11px;
          cursor: pointer;
        }

        .eventzaa-ai-clear:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        @media(max-width: 520px) {
          .eventzaa-ai-window {
            left: 10px;
            right: 10px;
            bottom: 90px;
            width: auto;
            height: min(600px, calc(100dvh - 110px));
          }

          .eventzaa-ai-button {
            right: 17px;
            bottom: 17px;
          }
        }
      `}</style>

      {open && (
        <section className="eventzaa-ai-window">
          <header className="eventzaa-ai-header">
            <div className="eventzaa-ai-avatar">🤖</div>

            <div className="eventzaa-ai-heading">
              Eventzaa AI Assistant
              <div className="eventzaa-ai-subtitle">
                Powered by Gemini AI
              </div>
            </div>

            <button
              className="eventzaa-ai-clear"
              type="button"
              onClick={clearChat}
              disabled={loading}
            >
              Clear
            </button>

            <button
              className="eventzaa-ai-close"
              onClick={() => setOpen(false)}
              type="button"
              aria-label="Close chatbot"
            >
              ×
            </button>
          </header>

          <div className="eventzaa-ai-messages">
            {messages.map((item, index) => (
              <div
                key={index}
                className={`eventzaa-ai-row ${
                  item.role === "user" ? "user" : ""
                }`}
              >
                {item.role !== "user" && (
                  <div className="eventzaa-ai-avatar">🤖</div>
                )}

                <div className="eventzaa-ai-bubble">
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="eventzaa-ai-typing">
                🤖 Gemini AI is thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            className="eventzaa-ai-footer"
            noValidate
            onSubmit={sendMessage}
          >
            <input
              ref={inputRef}
              className="eventzaa-ai-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about Eventzaa..."
              aria-label="Chat message"
              maxLength={2000}
              disabled={loading}
            />

            <button
              className="eventzaa-ai-send"
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="eventzaa-ai-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle AI chatbot"
      >
        {open ? "×" : "🤖"}
      </button>
    </>
  );
}
