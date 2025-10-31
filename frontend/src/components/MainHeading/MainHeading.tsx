import React, { type JSX } from 'react';
import styles from './MainHeading.module.scss';

interface MainHeadingProps {
    heading: string;
    childs: JSX.Element
}

const MainHeading: React.FC<MainHeadingProps> = ({ heading, childs }) => {
  return (
    <div className={styles.mainHeading}>
        <h1 className={styles.heading}>{ heading} </h1>
        <div className={styles.childs}>{ childs }</div>
    </div>
  )
}

export default MainHeading