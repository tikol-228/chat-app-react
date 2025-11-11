import React, { useEffect, useRef, useState } from 'react'
import sendIcon from '../assets/sendIcon.svg'
import img2 from '../assets/navigation/img2.png'
import call from '../assets/call.svg'
import videoCall from '../assets/videoCall.svg'
import theme from '../assets/theme.svg'
import about from '../assets/navigation/about.svg'
import styles from './ChatContent.module.css'

interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  ts: number
}

interface ChatContentProps {
  chatId?: string
  messages?: Message[]
  onSendMessage?: (chatId: string, text: string) => void
}

const ChatContent: React.FC<ChatContentProps> = ({ chatId, messages = [], onSendMessage }) => {
  const [text, setText] = useState('')
  const messagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = messagesRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    }
  }, [messages, chatId])

  const handleSend = () => {
    if (!chatId || !onSendMessage) return
    const val = text.trim()
    if (!val) return
    onSendMessage(chatId, val)
    setText('')
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!chatId) {
    return (
      <div className={styles.welcomeWrapper}>
        <div className={styles.welcomeBox}>
          <img src={img2} alt="Welcome" className={styles.welcomeImg} />
          <h3 className={styles.welcomeTitle}>Welcome to Your Conversations</h3>
          <p className={styles.welcomeText}>
            Select a chat from the list to start exploring your messages or begin a new conversation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chatContent}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2>Chat #{chatId}</h2>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerBtn} aria-label="Call">
            <img src={call} alt="Call" />
          </button>
          <button className={styles.headerBtn} aria-label="Video Call">
            <img src={videoCall} alt="Video Call" />
          </button>
          <button className={styles.headerBtn} aria-label="Themes">
            <img src={theme} alt="Themes" />
          </button>
          <button className={styles.headerBtn} aria-label="About">
            <img src={about} alt="About" />
          </button>
        </div>
      </div>

      <div className={styles.messages} ref={messagesRef}>
        {messages.length === 0 ? (
          <p className={styles.emptyMessage}>This is where your messages will appear...</p>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`${styles.msgRow} ${m.sender === 'me' ? styles.me : styles.them}`}>
              <div className={styles.msgBubble}>
                <div className={styles.msgText}>{m.text}</div>
                <div className={styles.msgTs}>
                  {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.messageInputWrapper}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Message"
            className={styles.messageInput}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className={styles.sendBtn} aria-label="Send message" onClick={handleSend}>
            <img src={sendIcon} alt="send" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatContent