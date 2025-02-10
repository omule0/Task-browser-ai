import Message from "./Message";
import { Message as MessageType } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export default function MessageList({ messages }: { messages: MessageType[] }) {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={message.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Message
              rawResponse={message.rawResponse}
              text={message.text}
              sender={message.sender === "user" ? "user" : "ai"}
              toolCalls={message.toolCalls}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
