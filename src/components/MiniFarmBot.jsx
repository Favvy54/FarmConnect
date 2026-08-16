import { useState } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";

import { askMiniFarmBot } from "../services/auth.js";

export default function MiniFarmBot() {

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi! I'm Mini Farm Bot 🌱 How can I help you find food on FarmConnect?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {

      const response =
        await askMiniFarmBot(
          trimmedMessage
        );

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            response?.data?.reply ||
            "Sorry, I couldn't answer that right now.",
        },
      ]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            error.message ||
            "Mini Farm Bot is temporarily unavailable.",
        },
      ]);

    } finally {

      setLoading(false);

    }
  };

  const handleKeyDown = (e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleSend();

    }

  };

  return (
    <>
      {/* Floating Bot Button */}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="
            fixed
            bottom-6
            right-6
            z-50
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-green-normal
            text-white
            shadow-lg
            transition
            hover:scale-105
          "
          aria-label="Open Mini Farm Bot"
        >
          <Bot className="h-7 w-7" />
        </button>
      )}

      {/* Chat Window */}

      {isOpen && (
        <div
          className="
            fixed
            bottom-6
            right-6
            z-50
            flex
            h-[500px]
            w-[350px]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-border-muted
            bg-white
            shadow-2xl
          "
        >

          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              bg-green-normal
              px-4
              py-3
              text-white
            "
          >

            <div className="flex items-center gap-2">

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-white/20
                "
              >
                <Bot className="h-5 w-5" />
              </div>

              <div>

                <p className="font-semibold">
                  Mini Farm Bot
                </p>

                <p className="text-xs text-white/80">
                  FarmConnect Assistant
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="
                rounded-full
                p-1
                hover:bg-white/20
              "
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* Messages */}

          <div
            className="
              flex-1
              space-y-3
              overflow-y-auto
              bg-gray-50
              p-4
            "
          >

            {messages.map(
              (item, index) => (

                <div
                  key={index}
                  className={`flex ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`
                      max-w-[82%]
                      rounded-2xl
                      px-3
                      py-2
                      text-sm
                      whitespace-pre-wrap
                      ${
                        item.role === "user"
                          ? "rounded-br-sm bg-green-normal text-white"
                          : "rounded-bl-sm bg-white text-ink shadow-sm"
                      }
                    `}
                  >
                    {item.text}
                  </div>

                </div>

              )
            )}

            {loading && (

              <div className="flex justify-start">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-2xl
                    rounded-bl-sm
                    bg-white
                    px-3
                    py-2
                    text-sm
                    text-body-text
                    shadow-sm
                  "
                >

                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />

                  Mini Farm Bot is thinking...

                </div>

              </div>

            )}

          </div>

          {/* Input */}

          <div
            className="
              flex
              items-center
              gap-2
              border-t
              border-border-muted
              bg-white
              p-3
            "
          >

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask Mini Farm Bot..."
              disabled={loading}
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-border-muted
                px-3
                py-2
                text-sm
                outline-none
                focus:border-green-normal
              "
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={
                loading ||
                !message.trim()
              }
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-green-normal
                text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Send className="h-4 w-4" />
            </button>

          </div>

        </div>
      )}

    </>
  );
}
