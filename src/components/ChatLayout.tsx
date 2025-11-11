import React, { useEffect, useState } from 'react'
import img from '../assets/navigation/img.png'
import BottomNav from './BottomNav'
import ChatContent from './ChatContent'
import LeftHeader from './LeftHeader'
import AddChatModal from './AddChatModal'
import styles from './ChatLayout.module.css'

interface Chat {
  id: string
  name: string
}

interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  ts: number
}

const ChatLayout: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string>()
  const [menuOpen, setMenuOpen] = useState(false)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    // dynamic import socket wrapper so app still works if socket isn't available
    let mounted = true
    import('../lib/socket').then(mod => {
      const { initSocket } = mod
      initSocket(
        (id: number) => {
          if (!mounted) return
          setUserId(id)
        },
        (payload: any) => {
          // expect incoming payload to contain { chatId, text, from, ts, id }
          if (!payload) return
          const chatId = payload.chatId
          if (!chatId) return
          const incoming: Message = {
            id: payload.id ?? chatId + '-s-' + Date.now(),
            text: payload.text ?? String(payload),
            sender: payload.from === userId ? 'me' : 'them',
            ts: payload.ts ?? Date.now(),
          }
          setMessages(prev => {
            const prevFor = prev[chatId] ?? []
            return { ...prev, [chatId]: [...prevFor, incoming] }
          })
        }
      )
    }).catch(e => console.warn('Socket init error', e))
    return () => { mounted = false }
  }, [userId])

  const handleAddChat = (chatName: string, userId: string) => {
    const newChat: Chat = { id: userId + '-' + Date.now(), name: chatName }
    setChats(prev => [...prev, newChat])
    // initialize empty messages array for this chat
    setMessages(prev => ({ ...prev, [newChat.id]: [] }))
    // auto-select new chat
    setSelectedChatId(newChat.id)
  }

  const sendMessage = (chatId: string, text: string) => {
    if (!chatId) return
    const trimmed = text.trim()
    if (!trimmed) return
    const msg: Message = { id: chatId + '-' + Date.now(), text: trimmed, sender: 'me', ts: Date.now() }
    setMessages(prev => {
      const prevFor = prev[chatId] ?? []
      return { ...prev, [chatId]: [...prevFor, msg] }
    })

    // simple auto-reply to demonstrate messages from the other side
    // emit to socket server if available
    import('../lib/socket').then(mod => {
      try { mod.sendSocketMessage({ chatId, text: trimmed, from: userId ?? null, ts: Date.now(), id: chatId + '-c-' + Date.now() }) } catch (e) { }
    }).catch(() => {})

    // local demo reply if server doesn't reply
    setTimeout(() => {
      const reply: Message = { id: chatId + '-r-' + Date.now(), text: 'Received: ' + trimmed, sender: 'them', ts: Date.now() }
      setMessages(prev => {
        const prevFor = prev[chatId] ?? []
        return { ...prev, [chatId]: [...prevFor, reply] }
      })
    }, 700)
  }

  return (
    <div className={styles.appRoot}>
      <div className={styles.canvas}>
        <aside className={styles.leftPanel}>
          <LeftHeader
            chats={chats}
            onAddChat={() => setModalOpen(true)}
          />
          {chats.length === 0 ? (
            <div className={styles.emptyState}>
              <img src={img}/>
              <h4>No Conversations Yet</h4>
              <p className={styles.muted}>Start a new chat or invite others to join the conversation.</p>
            </div>
          ) : (
            <div className={styles.chatsList}>
              {chats.map(chat => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${selectedChatId === chat.id ? styles.selected : ''}`}
                >
                  <button
                    className={styles.chatMain}
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    <div className={styles.chatAvatar}>
                      {chat.name[0].toUpperCase()}
                    </div>
                    <div className={styles.chatInfo}>
                      <h4>{chat.name}</h4>
                      <p className={styles.muted}>Click to open chat</p>
                    </div>
                  </button>
                  <div className={styles.chatButtons}>
                    <button className={styles.publicBtn}>Public</button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => setChats(prev => prev.filter(c => c.id !== chat.id))}
                    >
                      Delete
                    </button>
                  </div>
                </div>
            ))}

            </div>
          )}
          <BottomNav />
        </aside>
        <main className={styles.mainPanel}>
          <ChatContent chatId={selectedChatId} messages={selectedChatId ? messages[selectedChatId] ?? [] : []} onSendMessage={sendMessage} />
        </main>
      </div>

      <AddChatModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={(chatName: string, userId: string) => {
        handleAddChat(chatName, userId)
        setModalOpen(false)
    }}
  />
    </div>
  )
}

export default ChatLayout
