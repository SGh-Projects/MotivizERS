import React, { useState, useEffect } from 'react';
import {Modal,ModalOverlay,ModalContent,ModalHeader,ModalFooter, ModalBody, ModalCloseButton, Button} from "@chakra-ui/react";

const CourseSuccessModal = ({ isOpen, onClose, name, mode }) => {
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    switch (mode) {
      case "add-course":
        setHeader("Course Added Successfully");
        setBody(`Successfully added the course "${name}".`);
        break;
      case "edit-course":
        setHeader("Course Edited Successfully");
        setBody(`Successfully updated the course "${name}".`);
        break;
      case "delete-course":
        setHeader("Course Deleted Successfully");
        setBody(`Successfully deleted the course "${name}".`);
        break;
      default:
        setHeader('');
        setBody('');
    }
  }, [mode, name]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {body}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CourseSuccessModal;
