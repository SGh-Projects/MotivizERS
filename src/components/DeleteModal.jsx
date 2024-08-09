import React from 'react';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@chakra-ui/react";

const DeleteModal = ({ isOpen, onClose, courseName, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Course</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete the course "{courseName}"? This action is irreversible.
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="gray" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" onClick={() => {
                  onConfirm(); // This should handle the deletion logic
                  onClose(); // Close the modal after confirming
                }}>
                Confirm Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      );
};

export default DeleteModal;
