import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";
import { create_admin } from '../controllers/Admin';

const AddAdminModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminId, setAdminId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [description, setDescription] = useState('');
  const toast = useToast();

  const handleAddAdmin = async () => {
    if (!email.trim() || !password.trim() || !adminId.trim() || !firstName.trim() || !lastName.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please ensure all required fields are filled out.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const adminData = {
      id: adminId,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      desc: description,
      img_url: imgUrl,
    };

    try {
      const response = await create_admin(adminData);
      if (response.success) {
        toast({
          title: "Admin Added",
          description: "The new admin has been successfully added.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // Reset form fields
        setEmail('');
        setPassword('');
        setAdminId('');
        setFirstName('');
        setLastName('');
        setImgUrl('');
        setDescription('');
        onClose(); // Close the modal on successful addition
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: "Error Adding Admin",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW={{ base: "90%", sm: "70%", md: "500px", lg: "600px" }}>
        <ModalHeader bg="teal.300" color="white" roundedTop="md">Add New Admin</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>Password</FormLabel>
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>Admin ID</FormLabel>
            <Input placeholder="Admin ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>First Name</FormLabel>
            <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormControl>
          <FormControl isRequired mt={4}>
            <FormLabel>Last Name</FormLabel>
            <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Image URL (optional)</FormLabel>
            <Input placeholder="Image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description (optional)</FormLabel>
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter bg="teal.300" roundedTop="md">
          <Button colorScheme="teal" mr={3} onClick={handleAddAdmin}>Add</Button>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddAdminModal;

