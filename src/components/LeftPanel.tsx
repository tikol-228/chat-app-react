import React, { useState } from 'react';
import AddChatModal from './AddChatModal';
import styles from './LeftPanel.module.css';

interface Chat {
  name: string;
  userId: string;
}

const LeftPanel: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const handleAddChat = (name: string, userId: string) => {
    setChats([...chats, { name, userId }]);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
      setChats(chats.filter((chat) => chat.userId !== chatId));
      if (selectedChat === chatId) setSelectedChat(null);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Чаты</h2>
        <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
          Добавить чат
        </button>
      </div>

      <ul className={styles.chatList}>
        {chats.length === 0 && <li className={styles.empty}>Нет чатов</li>}
        {chats.map((chat) => (
          <li
            key={chat.userId}
            className={`${styles.chatItem} ${
              selectedChat === chat.userId ? styles.activeChat : ''
            }`}
          >
            <div onClick={() => handleSelectChat(chat.userId)}>
              <strong>{chat.name}</strong>
              <br />
              <span className={styles.chatId}>ID: {chat.userId}</span>
            </div>
            <button
              className={styles.deleteBtn}
              onClick={() => handleDeleteChat(chat.userId)}
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <AddChatModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddChat={handleAddChat}
      />
    </div>
  );
};

export default LeftPanel;
