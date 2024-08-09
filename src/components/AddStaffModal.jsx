import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";
import { create_staff } from '../controllers/Staff';
import { admin_add_user_to_sys } from '../controllers/Admin';

const AddStaffModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffId, setStaffId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleAddStaff = async () => {
    if (!email || !password || !staffId || !firstName || !lastName) {
      toast({
        title: "Required fields missing",
        description: "Please ensure all required fields are filled out.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    const staffData = {
      email,
      password,

      id: staffId,
      first_name: firstName,
      last_name: lastName,

      desc: description,
      img_url: imgUrl,
    };

    try {

      const response = await create_staff(staffData);
      if (response.success) {
        toast({
          title: "Staff added successfully",
          description: "The new staff member has been successfully added.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetForm();
        onClose(); 
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      toast({
        title: "Error adding staff",
        description: error.message || 'Failed to add staff.',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setStaffId('');
    setImgUrl('');
    setDescription('');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg="teal.300" color="white" roundedTop="md">Add New Staff Member</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Staff ID</FormLabel>
            <Input placeholder="Staff ID" value={staffId} onChange={(e) => setStaffId(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>First Name</FormLabel>
            <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Last Name</FormLabel>
            <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Image URL</FormLabel>
            <Input placeholder="Image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter bg="teal.300" color="white" roundedTop="md">
          <Button colorScheme="teal" mr={3} onClick={handleAddStaff} isLoading={isLoading}>
            Add
          </Button>
          <Button onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddStaffModal;
