import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, type Variants, AnimatePresence } from "framer-motion";

import styles from "./MessageBar.module.scss";
import type { RootState } from "../../app/store";
import { removeMessage } from "../../features/message";

// Animation variants
const messageVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.3 } },
};

const MessageBar = () => {
  const messages = useSelector((state: RootState) => state.messages);
  const dispatch = useDispatch();

  // Auto-remove messages after 2s
  useEffect(() => {
    const timers = messages.map((msg) =>
      setTimeout(() => dispatch(removeMessage(msg.id)), 2000)
    );
    return () => timers.forEach(clearTimeout);
  }, [messages, dispatch]);

  return (
    <motion.div className={styles.messageContainer}>
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            className={`${styles.message} ${styles[msg.type]}`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          >
            <span>{msg.text}</span>
            <button onClick={() => dispatch(removeMessage(msg.id))}>✖</button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessageBar;
