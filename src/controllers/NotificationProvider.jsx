// for the notification bell to reflect real time changes
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  return (
    <NotificationContext.Provider value={{ hasUnreadNotifications, setHasUnreadNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
