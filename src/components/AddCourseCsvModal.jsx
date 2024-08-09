import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";

import Admin from '../models/Admin';

const AddCourseCsvModal = ({ isOpen, onClose }) => {
    const [csv, setCsv] = useState('');
    const toast = useToast();

    const handleCourseCsv = async (event) => {
        try {
            const file = event.target.files[0];
            const reader = new FileReader();
    
            reader.onload = async function(event) {
                const csvData = event.target.result;
                const lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
    
                const users = lines.map(line => {
                    const fields = line.split(','); // Split line into fields
                    return {
                        code: fields[0],
                        period: fields[1],
                        name: fields[2],
                        desc: fields[3],
                        year: fields[4],
                        semester: fields[5],
                        img: null,
                    };
                });
    
                setCsv(users);
            };
    
            reader.readAsText(file);
        } catch (error) {
            console.error('Error handling CSV file:', error);
        }
    }

    const handleCourseCsvSubmit = async () => {
        try {
            const response = await Admin.csv_course(csv);

            if (response) {
                toast({
                  title: "Courses added successfully",
                  description: "The new courses have been successfully added.",
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
                <ModalHeader bg="teal.300" color="white" roundedTop="md">Add New Courses</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Upload Course CSV</FormLabel>
                        {/* Changed value to undefined, as file inputs cannot have predefined value */}
                        <Input type='file' placeholder="User CSV file" onChange={handleCourseCsv} />
                    </FormControl>
                </ModalBody>
                <ModalFooter bg="teal.300" color="white" roundedTop="md">
                    <Button colorScheme="teal" mr={3} onClick={handleCourseCsvSubmit}>
                        Add
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default AddCourseCsvModal;
