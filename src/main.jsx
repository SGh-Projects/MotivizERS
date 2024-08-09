import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import TopNav from './components/TopNav.jsx';
import BottomNav from './components/BottomNav.jsx';
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { get_user_by_uid } from './controllers/Auth.jsx'
import {NotificationProvider} from './controllers/NotificationProvider.jsx';

const Main = () => {
  const [userType, setUserType] = useState('');
  const auth = getAuth()

  //useEffect hook to determine usertype
  useEffect(() => {

    const handleUserTypeChange = onAuthStateChanged(auth, async (user) => {
      if (user) {
          // User is signed in.  
          const userRec = await get_user_by_uid(user.uid);
          setUserType(userRec.role || 'guest');
          
      } else {
          // User is signed out.
          setUserType('guest');
      }
  });
  return () => handleUserTypeChange();
}, []);

  return (
    <ChakraProvider>
      <BrowserRouter>
      <NotificationProvider>
          <TopNav />
          <App userType={userType}  />
          <BottomNav userType={userType} />
        </NotificationProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
