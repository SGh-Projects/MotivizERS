import React, {useState, useEffect} from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, CardBody } from "@chakra-ui/react";

//reusable modal for success actions with a close button
//add modes to edit the header/body
const SuccessModal = ({ isOpen, onClose, name, mode }) => {
    const [header, setHeader] = useState('');
    const [body, setBody] = useState('');

    useEffect( () => {
        if (mode === "add-prize"){
            setHeader("Prize Added Successfully");
            setBody(`Successfully added Item ${name} to the Merit Shop.`);
        }
        if (mode === "edit-prize"){
            setHeader("Prize Edited Successfully");
            setBody(`Successfully edited ${name} details.`); 
        }
        if (mode === "delete-prize"){
            setHeader("Prize Deleted Successfully");
            setBody(`Successfully removed Item ${name} from the Merit Shop.`);
        }
        if (mode === "redeem-prize"){
            setHeader("Prize Redeemed Successfully");
            setBody(`Successfully redeemed ${name} from the Merit Shop.`);
        }
    }, [mode, name]);


    return (
        <Modal isOpen={isOpen} onClose={onClose} >
            <ModalOverlay />
            <ModalContent align="center" width="xl">
                <ModalHeader backgroundColor="#4FD1C5" color="white" borderRadius="md">{header}</ModalHeader>
                <ModalCloseButton />
                <ModalBody align="center">
                    {body}
                </ModalBody>
                    
                <ModalFooter alignItems="center" borderRadius="md">
                    <Button colorScheme="teal" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default SuccessModal;
