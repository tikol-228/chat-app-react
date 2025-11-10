import React from 'react'
import callsIcon from '../assets/navigation/calls.svg'
import chatsIcon from '../assets/navigation/chats.svg'
import groupsIcon from '../assets/navigation/groups.svg'
import usersIcon from '../assets/navigation/users.svg'
import styles from './BottomNav.module.css'

const BottomNav: React.FC = () => (
  <nav className={styles.bottomNav} aria-label="primary navigation">
    <button className={`${styles.navItem} ${styles.active}`}> 
      <span className={styles.navIcon}><img src={chatsIcon}/></span>
      <span className={styles.navLabel}>Chats</span>
    </button>
    <button className={styles.navItem}>
      <span className={styles.navIcon}><img src={callsIcon}/></span>
      <span className={styles.navLabel}>Calls</span>
    </button>
    <button className={styles.navItem}>
      <span className={styles.navIcon}><img src={usersIcon}/></span>
      <span className={styles.navLabel}>Users</span>
    </button>
    <button className={styles.navItem}>
      <span className={styles.navIcon}><img src={groupsIcon}/></span>
      <span className={styles.navLabel}>Groups</span>
    </button>
  </nav>
)

export default BottomNav