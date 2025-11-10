import React, { useState, useRef } from 'react'
import aboutIcon from '../assets/navigation/about.svg'
import settingsIcon from '../assets/navigation/settings.svg'
import styles from './LeftHeader.module.css'

interface Chat {
  id: string
  name: string
}

interface LeftHeaderProps {
  chats: Chat[]
  onAddChat: () => void
}

const LeftHeader: React.FC<LeftHeaderProps> = ({ chats, onAddChat }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleAboutClick = () => setMenuOpen(!menuOpen)

  return (
    <div className={styles.leftHeader} style={{ position: 'relative' }}>
      <h2>Chats</h2>
      <div className={styles.headerActions}>
        <button className={styles.iconBtn} aria-label="settings">
          <img src={settingsIcon} alt="Settings" />
        </button>
        <button className={styles.iconBtn} aria-label="more" onClick={handleAboutClick}>
          <img src={aboutIcon} alt="More" />
        </button>

        {menuOpen && (
          <div ref={menuRef} style={{
            position: 'absolute',
            right: 0,
            top: '40px',
            background: '#232323',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '8px',
            zIndex: 10
          }}>
            <button onClick={onAddChat} style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              padding: '6px 12px',
              cursor: 'pointer',
              width: '100%'
            }}>Add Chat</button>
          </div>
        )}
      </div>

      {/* Список чатов */}
      <div style={{ marginTop: '16px' }}>
        {chats.map(chat => (
          <div key={chat.id} style={{
            padding: '8px 12px',
            background: '#2a2a2a',
            marginBottom: '4px',
            borderRadius: '6px',
            color: '#fff'
          }}>
            {chat.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeftHeader
