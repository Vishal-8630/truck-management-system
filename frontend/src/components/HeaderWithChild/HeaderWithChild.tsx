import React from 'react';
import styles from './HeaderWithChild.module.scss';

interface HeaderWithChildProps {
    heading: string,
    child: React.ReactNode
}

const HeaderWithChild: React.FC<HeaderWithChildProps> = ({ heading, child }) => {
  return (
    <div className={styles.headerWithChildContainer}>
        <h1 className={styles.heading}>{ heading }</h1>
        { child }
    </div>
  )
}

export default HeaderWithChild