import React, { useState } from 'react';
import AddChatModal from './AddChatModal';

interface Chat {
  name: string;
  userId: string;
}

const LeftPanel: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);

  const handleAddChat = (name: string, userId: string) => {
    setChats([...chats, { name, userId }]);
  };

  return (
    <div style={{width: '320px', background: '#181818', color: '#fff', height: '100vh', display: 'flex', flexDirection: 'column', borderRight: '1px solid #232323'}}>
      <div style={{padding: '16px', borderBottom: '1px solid #232323', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2 style={{margin: 0}}>Чаты</h2>
        <button onClick={() => setModalOpen(true)} style={{background: '#232323', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer'}}>Добавить чат</button>
      </div>
      <ul style={{listStyle: 'none', margin: 0, padding: '16px', flex: 1, overflowY: 'auto'}}>
        {chats.length === 0 && <li style={{color: '#aaa'}}>Нет чатов</li>}
        {chats.map((chat, idx) => (
          <li key={idx} style={{padding: '10px 0', borderBottom: '1px solid #232323'}}>
            <strong>{chat.name}</strong><br/>
            <span style={{fontSize: '12px', color: '#aaa'}}>ID: {chat.userId}</span>
          </li>
        ))}
      </ul>
      <AddChatModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAddChat={handleAddChat} />
    </div>
  );
};

export default LeftPanel;