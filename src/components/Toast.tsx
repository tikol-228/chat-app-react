import React from 'react';
import styles from './Toast.module.css';

type Props = {
  message: string;
  type?: 'success' | 'error';
  onClose?: () => void;
};

const Toast: React.FC<Props> = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`${styles.toast} ${type === 'error' ? styles.error : styles.success}`}>
      <span className={styles.msg}>{message}</span>
      <button className={styles.closeBtn} onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;
