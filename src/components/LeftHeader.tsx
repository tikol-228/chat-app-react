import React from 'react'
import settingsIcon from '../assets/navigation/settings.svg'
import styles from './LeftHeader.module.css'

interface Chat {
  id: string
  name: string
}

interface LeftHeaderProps {
  chats: Chat[]
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>
  onAddChat: () => void
}

const LeftHeader: React.FC<LeftHeaderProps> = ({ chats, setChats, onAddChat }) => {

  const handleDeleteChat = (id: string) => {
    setChats(chats.filter(chat => chat.id !== id))
  }

  return (
    <div className={styles.leftHeader}>
      {/* Заголовок и кнопки */}
      <div className={styles.headerTop}>
        <h2>Chats</h2>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} onClick={onAddChat}>Add Chat</button>
          <button className={styles.iconBtn} aria-label="settings">
            <img src={settingsIcon} alt="Settings" />
          </button>
        </div>
      </div>

      {/* Список чатов */}
      {chats.length > 0 ? (
        <div className={styles.chatList}>
          {chats.map(chat => (
            <div key={chat.id} className={styles.chatItem}>
              <span>{chat.name}</span>
              <div className={styles.chatButtons}>
                <button 
                  className={styles.deleteBtn} 
                  onClick={() => handleDeleteChat(chat.id)}
                >
                  Delete
                </button>
                <button className={styles.publicBtn}>Public</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyChat}>
          
        </div>
      )}
    </div>
  )
}

export default LeftHeader
