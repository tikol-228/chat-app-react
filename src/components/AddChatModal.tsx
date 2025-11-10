import React, { useState } from 'react';

interface AddChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChat: (chatName: string, userId: string) => void;
}

const AddChatModal: React.FC<AddChatModalProps> = ({ isOpen, onClose, onAddChat }) => {
  const [chatName, setChatName] = useState('');
  const [userId, setUserId] = useState('');

  if (!isOpen) return null;

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100}}>
      <div style={{background: '#232323', padding: '24px', borderRadius: '12px', minWidth: '320px'}}>
        <h3 style={{color: '#fff'}}>Add Chat</h3>
        <input
          type="text"
          placeholder="Chat name"
          value={chatName}
          onChange={e => setChatName(e.target.value)}
          style={{width: '100%', marginBottom: '12px', padding: '8px'}}
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{width: '100%', marginBottom: '12px', padding: '8px'}}
        />
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
          <button onClick={onClose} style={{padding: '8px 16px'}}>Сancel</button>
          <button onClick={() => { onAddChat(chatName, userId); setChatName(''); setUserId(''); onClose(); }} style={{padding: '8px 16px'}}>Add</button>
        </div>
      </div>
    </div>
  );
};

export default AddChatModal;