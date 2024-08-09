import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";
import { create_student } from '../controllers/Student';

const AddStudentModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const toast = useToast();

  const handleAddStudent = async () => {
    if (!email || !password || !studentId || !firstName || !lastName) {
      toast({
        title: "Required fields missing",
        description: "Please ensure all fields are filled out.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const studentData = {
      email,
      password,
      id: studentId,
      first_name: firstName,
      last_name: lastName,
      desc: description,
      img_url: imgUrl,
      //role: 'student'
    };

    try {
      await create_student(studentData);
      toast({
        title: "Student added successfully",
        description: "The new student has been successfully added.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose(); // Close the modal on successful addition
    } catch (error) {
      toast({
        title: "Error adding student",
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
      
      <ModalContent>
        <ModalHeader bg="teal.300" color="white" roundedTop="md">Add New Student</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Password</FormLabel>
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Student ID</FormLabel>
            <Input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
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
            <Input placeholder="Short description about the student" value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          
          <FormControl mt={4}>
            <FormLabel>Image URL</FormLabel>
            <Input placeholder="URL of the student's image" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} />
          </FormControl>
        </ModalBody>
        <ModalFooter bg="teal.300" color="white" roundedTop="md">
          <Button colorScheme="teal" mr={3} onClick={handleAddStudent}>
            Add
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddStudentModal;
