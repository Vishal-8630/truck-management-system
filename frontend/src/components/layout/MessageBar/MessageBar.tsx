import { useEffect } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useMessageStore } from "@/store/useMessageStore";


// Animation variants
const messageVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const MessageBar = () => {
  const { messages, removeMessage } = useMessageStore();

  useEffect(() => {
    const timers = messages.map((msg) =>
      setTimeout(() => removeMessage(msg.id), 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [messages, removeMessage]);

  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={messageVariants}
            className={`
              flex items-start justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-md
              ${msg.type === 'success'
                ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800'
                : 'bg-red-50/90 border-red-100 text-red-800'}
            `}
          >
            <span className="text-sm font-semibold leading-relaxed">{msg.text}</span>
            <button
              onClick={() => removeMessage(msg.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors ml-2 shrink-0"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default MessageBar;
