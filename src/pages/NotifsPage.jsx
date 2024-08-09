import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, Text, Divider, Modal, ModalContent, ModalBody, ModalFooter, ModalHeader, ModalOverlay, ModalCloseButton } from "@chakra-ui/react";
import CardNotification from '../components/CardNotification';
import { get_current_user } from '../controllers/Auth';
import { get_user_notifications, read_notification } from '../controllers/Notifications';
import { get_user_by_id } from '../controllers/Auth'
import { useNotificationContext } from '../controllers/NotificationProvider';

const NotifsPage = ({ userType }) => {
  const [user, setUser] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isReadModalOpen, setIsReadModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sender, setSender] = useState(null);
  const { setHasUnreadNotifications } = useNotificationContext();
  const [index, setIndex] = useState(0); 

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await get_current_user();
      setUser(currentUser);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchNotifs = async () => {
    try {
      if (user && user.id) {
        const unsubscribe = get_user_notifications(user.id, (updatedNotifications) => {
          const filteredNotifications = updatedNotifications.filter(notification => notification.notifTitle);
          const sortedNotifications = filteredNotifications.sort((a, b) => b.notifTimestamp - a.notifTimestamp);
          setNotifications(sortedNotifications.map(notification => ({ ...notification, read: notification.notifReadStatus })));
        });

        return () => {
          unsubscribe();
        };
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const handleOpenReadModal = async (index) => {
    setIndex(index)
    setSelectedNotification(notifications[index]);
    const senderInfo = await get_user_by_id(notifications[index].initiatorID);
    if (senderInfo) {
      setSender(senderInfo);
      setIsReadModalOpen(true);
    } else {
      console.error('Failed to fetch sender information');
    }
  };

  const handleCloseReadModal = () => {
    setIsReadModalOpen(false);
    setSelectedNotification(null);
    setSender(null);
  };

  const handleOpenUnreadModal = async (index) => {  
    try {
      const response = await read_notification(user.id, notifications[index].uid);
      if (response === true) {
        const senderInfo = await get_user_by_id(notifications[index].initiatorID);

        if (senderInfo) {
          setSender(senderInfo); 
          setSelectedNotification(notifications[index]);
          handleOpenReadModal(index); 
        } else {
          console.error('Failed to fetch sender information');
        }
        // Check if there are any more unread notifications
        const remainingUnreadNotifications = notifications.filter((notification, currentIndex) => {
          return !notification.read && currentIndex !== index;
        });

        if (remainingUnreadNotifications.length === 0) {
          setHasUnreadNotifications(false);
        }
        
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <Box p={5} px="5%" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }} width={{ base: "100%", md: "90%" }} marginX="auto" background="white">
      <div className="page-title" style={{ marginBottom: "16px", fontWeight: "bold", textAlign: "center", color: "#319795" }}>
        My Notifications
      </div>
      <Stack spacing={4} mt={5}>
        {notifications.filter(notification => !notification.read).length > 0 && (
          <>
            <Text fontWeight="bold" color="red" textAlign="right">New Notifications ({notifications.filter(notification => !notification.read).length})</Text>
            <Divider borderColor="red" />
            {notifications.map((notification, originalIndex) => {
              const isUnread = !notification.read;
              if (isUnread){
                return (
                  <CardNotification key={originalIndex} data={{ ...notification, index: originalIndex }} onOpenReadModal={() => handleOpenUnreadModal(originalIndex)}  
                  />
                );
              }
            })}
          </>
        )}

        {notifications.filter(notification => notification.read).length > 0 && (
          <>
            <Divider borderColor="teal" />
            {notifications.filter(notification => notification.read).map((notification, index) => (
              <CardNotification key={index} data={{ ...notification, index }} onOpenReadModal={() => handleOpenReadModal(index)} />
            ))}
          </>
        )}

        {notifications.length === 0 && (
          <Text mt={4}>No notifications yet.</Text>
        )}
      </Stack>

      <Modal size="lg" isOpen={isReadModalOpen} onClose={handleCloseReadModal}>
        <ModalOverlay />
        {selectedNotification && sender && (
          <ModalContent align="center">
            <ModalHeader backgroundColor="#4FD1C5" color="white">
              {selectedNotification.notifTitle}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody align="left">
              <Text w="100%" fontSize="lg" mb={4} whiteSpace="pre-wrap">
                {selectedNotification.notifDesc}
              </Text>
              {userType !== "admin" && (<Text>Current Points: {user.current_pts}</Text>)}
              <Divider />
              <Text mt={1} textAlign="right" fontWeight="bold">
                Sender: {sender.first_name} {sender.last_name}</Text>
            </ModalBody>
            <ModalFooter py={0} backgroundColor="#4FD1C5" >
              <Button size="md" colorScheme="teal" onClick={handleCloseReadModal}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Modal>
    </Box>
  );
};

export default NotifsPage;
