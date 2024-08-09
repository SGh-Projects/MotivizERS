import { Box, Flex, Card, FormControl, FormLabel, Input, InputGroup, IconButton, Textarea, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useBreakpointValue } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import { MinusIcon, AddIcon } from "@chakra-ui/icons"; 
import SuccessModal from "./SuccessModal";
import { create_prize, edit_prize } from "../controllers/Prize"

const EditPrizeModal = ({ isOpen, onClose, prizeData, mode, onAddPrize }) => {
    // State variables
    const [title, setTitle] = useState('Add New Prize');
    const [prizeName, setPrizeName] = useState('');
    const [description, setDescription] = useState('');
    const [imgUrl, setImage] = useState(null);
    const [pointsCost, setPointsCost] = useState(0); 
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const modalWidth = useBreakpointValue({ base: "95%", md: "75%", lg: "75%" });
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect( () => {
        if (prizeData) {
            //used when editing
            setPrizeName(prizeData.name || '');
            setPointsCost(parseInt(prizeData.cost) || 0);
            setDescription(prizeData.desc || '');
            setImage(prizeData.img_url || './img.svg');
            setTitle("Edit Prize");
        }
        else {
            // used when adding new item, would be empty at the start
            setPrizeName(prizeName);
            setImage(imgUrl);
            setDescription(description);
            setPointsCost(pointsCost);
        }
    }, [isOpen, prizeData]);



    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            if (mode === 'edit-prize') {
                handleEditConfirmation();
            } else if (mode === 'add-prize') {
                // Handle add prize mode
                
                const success = create_prize(prizeName, pointsCost, 'tangible', description, imgUrl);
                if (success) {
                    console.log('Prize created successfully');

                    onAddPrize();
                    onClose();

                    setPrizeName('');
                    setImage('');
                    setDescription('');
                    setPointsCost(0);
                    
                    setIsSuccessModalOpen(true)
                } else {
                    console.error('Error creating prize');
                    // Handle error or show error message to the user
                }
            }
        }catch (error) {
                console.error("Error occurred during form submission:", error); 
        }
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImage(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };

      const handlePointsChange = (amount) => {
        setPointsCost(prevPoints => prevPoints + amount);
      };

      const handleDescChange = (e) => {
        setDescription(e.target.value);
      };

      const handleNameChange = (e) => {
        setPrizeName(e.target.value);
      };

    const handleEditConfirmation = () => {
        setIsConfirmModalOpen(true);
    };

    const handleConfirmEdit = () => {
        // logic to edit the prize data on db, placeholder for now
        try{
            setPrizeName(prizeName);
            prizeData.name= prizeName;
            prizeData.desc= description;
            prizeData.imgUrl = imgUrl;
            prizeData.point_cost=pointsCost;
            setIsConfirmModalOpen(true);

            const success = edit_prize(prizeData.id, prizeName, pointsCost, "Tangible", description, imgUrl);
                if (success) {
                    console.log('Prize Edited successfully');
                    setIsConfirmModalOpen(false);
                    setIsSuccessModalOpen(true);
                } else {
                    console.error('Error editing prize');
                    // Handle error or show error message to the user
                }
            onClose(); // Close the modal 
        }catch (error) {
            console.error("Error occurred during form submission:", error); 
        } 
        onClose(); // Close the main modal
    };

    const handleCancelEdit = () => {
        setIsConfirmModalOpen(false);
    };

      const handleCloseSuccessModal = () => { 
        setPointsCost(0);
        setImage(null);
        setPrizeName("");
        setDescription("");
        setIsSuccessModalOpen(false);
      };
      

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered borderRadius="md" scrollBehavior="inside">
            <ModalOverlay/>
            <ModalContent width={modalWidth} p="0px" overflowY="scroll">
                <form onSubmit={handleSubmit} >
                <ModalHeader borderRadius="md" textAlign="center" backgroundColor="#4FD1C5" color="white">{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody p="1">
                    {/* Form fields */}
                    <Flex mb="4" justifyContent="center">   
                        <Card w="100%"  m="5px" p="10px" textAlign="center" border="1px solid #CBD5E0" alignItems="center">
                            {imgUrl ? (
                                <div style={{transform: 'translate(0, 0)'}}>
                                    <img src={imgUrl} alt="Preview" style={{maxHeight: '250px' , objectFit: 'contain'}} />
                                </div>
                            
                            ) : (
                                <span>Upload Image to Preview</span>
                            )}
                            <span style={{margin: "10px", textAlign: "center", fontSize: "0.8em"}}>
                                <input type="file" accept="image/*" onChange={handleFileInputChange} />
                            </span>
                            
                        </Card> 
                        
                    </Flex>
                    <Box m="5">
                    <Flex>
                        <FormControl isRequired mb="4" display="inline-flex" flexDirection={{ base: "column", md: "row" }} alignItems="center">
                            <FormLabel align="left" width={{ base: "100%", md: "140px" }} mr={2} mb={{ base: "2", md: "2" }}>Prize Name:</FormLabel>
                            <Input type="text" value={prizeName} onChange={handleNameChange} />
                        </FormControl>
                    </Flex>
                    <Flex className="points-input-field" align="center" >
                        <FormControl isRequired display="inline-flex" flexDirection={{ base: "column", md: "row" }} alignItems="center">
                        <FormLabel align="left" mr={2} mb={{ base: 2, md: 0 }} width={{ base: "100%", md: "140px" }}>
                            Points Cost:
                        </FormLabel>
                        <div style={{ display: "inline-flex"}}>
                            <IconButton aria-label="Decrease points" icon={<MinusIcon />} onClick={() => handlePointsChange(-1)} size="sm" mr={1} isDisabled={pointsCost === 0} />
                            <InputGroup size="sm" w="120px">
                            <Input type="number" value={pointsCost === 0 ? '' : pointsCost} placeholder="0" onChange={(e) => setPointsCost(isNaN(parseInt(e.target.value)) ? 0 : Math.max(parseInt(e.target.value), 0))} required />
                            </InputGroup>
                            <IconButton aria-label="Increase points" icon={<AddIcon />} onClick={() => handlePointsChange(1)} size="sm" />
                        </div>
                        </FormControl>
                    </Flex>
                    <Flex className="comment-area" align="center" mt={5}>
                        <FormControl isRequired display="inline-flex" flexDirection={{ base: "column", md: "row" }} alignItems="center">
                        <FormLabel align="left" width={{ base: "100%", md: "160px" }} mb={{ base: 2, md: 2 }} mr={2}>
                            Enter Prize Description <span style={{ color: "#999" }}></span> :
                        </FormLabel>
                        <Textarea
                            value={description}
                            onChange={handleDescChange}
                            placeholder="Enter description here..."
                            size="md"
                            resize="both"
                            style={{ width: '100%' }}
                        />
                        </FormControl>
                    </Flex>
                    </Box>
                </ModalBody>

                <ModalFooter backgroundColor="#4FD1C5" borderRadius="md">
                    <Button type="submit" colorScheme="teal" mr={3}>
                        Save
                    </Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
        <ConfirmEditModal isOpen={isConfirmModalOpen} onClose={handleCancelEdit} onConfirm={handleConfirmEdit} prizeName={prizeName} isSuccessModalOpen={isSuccessModalOpen} handleCloseSuccessModal={handleCloseSuccessModal} mode="edit-prize"/>
        
        {mode === 'add-prize' && (
            <SuccessModal isOpen={isSuccessModalOpen} onClose={handleCloseSuccessModal} name={ prizeName } mode={ mode }></SuccessModal>
        )}
        
        
        </>
    );
};

const ConfirmEditModal = ({ isOpen, onClose, prizeName, onConfirm, isSuccessModalOpen, handleCloseSuccessModal, mode }) => {

    return (
        <>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent align="center" width="xl">
                <ModalHeader>Confirm Edit</ModalHeader>
                <ModalCloseButton />
                <ModalBody align="center">
                    Are you sure you want to save changes?
                </ModalBody>
                <ModalFooter alignItems="center">
                    <Button colorScheme="teal" onClick={onConfirm}>Confirm</Button>
                    <Button onClick={onClose}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        <SuccessModal isOpen={isSuccessModalOpen} onClose={handleCloseSuccessModal} name={ prizeName } mode={ mode }></SuccessModal>
        </>
    );
};


export default EditPrizeModal;
