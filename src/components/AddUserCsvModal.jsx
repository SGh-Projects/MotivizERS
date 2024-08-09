import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";

import Admin from '../models/Admin';

const AddUserCsvModal = ({ isOpen, onClose }) => {
    const [csv, setCsv] = useState('');
    const toast = useToast();

    const handleUserCsv = async (event) => {
        try {
            const file = event.target.files[0];
            const reader = new FileReader();
    
            reader.onload = async function(event) {
                const csvData = event.target.result;
                const lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
    
                const users = lines.map(line => {
                    const fields = line.split(','); // Split line into fields
                    return {
                        uid: null,
                        id: fields[0],
                        first_name: fields[1],
                        last_name: fields[2],
                        email: fields[3],
                        img_url: null,
                        desc: fields[4],
                        role: fields[5] 
                    };
                });
    
                setCsv(users);
            };
    
            reader.readAsText(file);
        } catch (error) {
            console.error('Error handling CSV file:', error);
        }
    }

    const handleCsvSubmit = async () => {
        try {
            const response = await Admin.csv_users(csv);

            if (response) {
                toast({
                  title: "Users added successfully",
                  description: "The new users have been successfully added.",
                  status: "success",
                  duration: 5000,
                  isClosable: true,
                });
                //resetForm();
                onClose(); 
              } else {
                throw new Error("Error adding Users");
              }
        } catch (error) {
            console.error('Error submitting CSV:', error);
        }
    }
    

    return(
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            
            <ModalContent>
                <ModalHeader bg="teal.300" color="white" roundedTop="md">Add New Users</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Upload User CSV</FormLabel>
                        {/* Changed value to undefined, as file inputs cannot have predefined value */}
                        <Input type='file' placeholder="User CSV file" onChange={handleUserCsv} />
                    </FormControl>
                </ModalBody>
                <ModalFooter bg="teal.300" color="white" roundedTop="md">
                    <Button colorScheme="teal" mr={3} onClick={handleCsvSubmit}>
                        Add
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default AddUserCsvModal;
