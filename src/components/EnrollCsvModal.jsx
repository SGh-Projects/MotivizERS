import React, { useState } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";

import { csv_enroll } from '../controllers/Course';

const EnrollCsvModal = ({ isOpen, onClose }) => {
    const [csv, setCsv] = useState('');
    const toast = useToast();

    const handleEnrollCsv = async (event) => {
        try {
            const file = event.target.files[0];
            const reader = new FileReader();
    
            reader.onload = async function(event) {
                const csvData = event.target.result;
                const lines = csvData.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines
    
                const users = lines.map(line => {
                    const fields = line.split(','); // Split line into fields
                    return {
                        user_id: fields[0],
                        course_id: fields[1],
                    };
                });
    
                setCsv(users);
            };
    
            reader.readAsText(file);
        } catch (error) {
            console.error('Error handling CSV file:', error);
        }
    }

    const handleEnrollCsvSubmit = async () => {
        try {
            console.log(csv);
            const response = await csv_enroll(csv);

            if (response) {
                toast({
                  title: "Users enrolled successfully",
                  description: "Users have been successfully enrolled to courses.",
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
                <ModalHeader bg="teal.300" color="white" roundedTop="md">Enroll Users</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <FormControl>
                        <FormLabel>Upload Enrollment CSV</FormLabel>
                        {/* Changed value to undefined, as file inputs cannot have predefined value */}
                        <Input type='file' placeholder="Enrollment CSV file" onChange={handleEnrollCsv} />
                    </FormControl>
                </ModalBody>
                <ModalFooter bg="teal.300" color="white" roundedTop="md">
                    <Button colorScheme="teal" mr={3} onClick={handleEnrollCsvSubmit}>
                        Add
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default EnrollCsvModal;
