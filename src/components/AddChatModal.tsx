import React, { useState } from "react";
import styles from "./AddChatModal.module.css";

interface AddChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (chatType: string, chatName: string) => void;
}

const AddChatModal: React.FC<AddChatModalProps> = ({ onClose, onCreate, isOpen }) => {
  const [chatType, setChatType] = useState<"public" | "private" | "password">("public");
  const [chatName, setChatName] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(chatType, chatName);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Chat</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Type</label>
            <div className={styles.typeSwitch}>
              <button
                type="button"
                className={`${styles.typeBtn} ${chatType === "public" ? styles.active : ""}`}
                onClick={() => setChatType("public")}
              >
                Public
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${chatType === "private" ? styles.active : ""}`}
                onClick={() => setChatType("private")}
              >
                Private
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${chatType === "password" ? styles.active : ""}`}
                onClick={() => setChatType("password")}
              >
                Password
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input
              type="text"
              placeholder="Enter chat name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          {chatType === "password" && (
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
            </div>
          )}

          <button type="submit" className={styles.createBtn}>
            Create Chat
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddChatModal;
