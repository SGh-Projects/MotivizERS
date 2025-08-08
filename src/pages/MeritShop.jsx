import { Box, Button } from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flex, Image, Text, Card, CardBody, CardHeader, Divider, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Spacer, Modal, ModalOverlay, ModalBody, ModalHeader, ModalContent, ModalCloseButton, ModalFooter } from '@chakra-ui/react'
import AutocompleteSearchBar from "../components/SearchBar";
import EditPrizeModal from "../components/EditPrizeModal";
import CardItem from '../components/CardItem';
import SuccessModal from "../components/SuccessModal";
import { get_all_available_prizes, delete_prize, redeem_prize } from "../controllers/Prize";
import { get_current_user } from "../controllers/Auth";

export default function MeritShop({userType}) {
  const location = useLocation(); 
  const [index, setIndex] = useState(0);
  const [prizes, setPrizes] = useState([]);
  const [selectedPrize, setSelectedPrize] = useState([])
  const [displayedPrizes, setDisplayedPrizes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
 

  const tabsContainerStyle = {
    flex: 1,
  };

  useEffect(() => {
    // Fetch all prizes when the component mounts
    fetchPrizes(); 
}, []);


const fetchPrizes = async () => {
  try {
      const allPrizes = await get_all_available_prizes();
      if (allPrizes) {
          setPrizes(allPrizes);
          setDisplayedPrizes(allPrizes)
      } else {
          console.log('No prizes found.');
      }
  } catch (error) {
      // Handle error
      console.error('Error fetching prizes:', error);
  }
};


  const [isEditPrizeModalOpen, setEditPrizeModalOpen] = useState(Array(prizes.length).fill(false));
  const [isConfirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(Array(prizes.length).fill(false));
  const [isAddPrizeModalOpen, setAddPrizeModalOpen] = useState(false);
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState (Array(prizes.length).fill(false));
  const [isRedeemedModalOpen, setIsRedeemedModalOpen] = useState (Array(prizes.length).fill(false));
  const [itemDetailModalOpen, setItemDetailModalOpen] = useState(Array(prizes.length).fill(false));
  const [isConfirmRedemptionModalOpen, setConfirmRedemptionModalOpen] = useState(Array(prizes.length).fill(false));

  const handleTabClick = (event) => {
    // Prevent the default tab switching behavior
    event.preventDefault();
  };

  const handleAddPrizeClick = () => {
    setAddPrizeModalOpen(true);
  };

  const handleEditPrizeClick = (index) => {
      setIndex(index);
      setEditPrizeModalOpen((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleDeletePrizeClick = (index) => {
      setIndex(index);
      setConfirmDeleteModalOpen((prev) => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
    });
  }

  const handleRedeemPrizeClick = (index) => {
    setIndex(index);
    setConfirmRedemptionModalOpen((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
  });
}

  const handleCloseEditPrizeModal = (index) => {
    const updatedEditModalState = [...isEditPrizeModalOpen];
    updatedEditModalState[index] = false;
    setEditPrizeModalOpen(updatedEditModalState);
  };

  const handleCancelDelete = (index) => {
    const newState = [...isDeletedModalOpen];
    newState[index] = false;
    setConfirmDeleteModalOpen(newState);
  };

  const handleCancelRedeem = (index) => {
    const newState = [...isConfirmRedemptionModalOpen];
    newState[index] = false;
    setConfirmRedemptionModalOpen(newState);
  };

  const handleCloseDeletedModal = (index) => {
    const newState = [...isDeletedModalOpen];
    newState[index] = false;
    setIsDeletedModalOpen(newState);
  };

  const handleCloseRedeemSuccessModal = (index) => {
    const newState = [...isRedeemedModalOpen];
    newState[index] = false;
    setIsRedeemedModalOpen(newState);
    fetchPrizes();
  };

  const handleConfirmDelete = async (index) => {
    // logic to delete the prize data on db, placeholder for now
    try{
         
        // Update the modal state
        setIndex(index);

        const success = await delete_prize(prizes[index].id);
        if (success) {
            console.log('Prize Deleted successfully');
        
            setIsDeletedModalOpen((prev) => { 
              const newState = [...prev]; // Create a new array 
              newState[index] = true; // Set the modal state for the selected index to true
              return newState;
            });

            setConfirmDeleteModalOpen((prev) => {
              const newState = [...prev]; // Create a new array 
              newState[index] = false; // Set the modal state for the selected index to false
              return newState;
            }); 

          // Update the prizes after deletion
          await fetchPrizes();
      } else {
        console.error('Error deleting prize');
        // Handle error or show error message to the user
    }

    }catch (error) {
        console.error("Error occurred during form submission:", error); 
    }
};

const handleConfirmRedeem = async (index) => {
  // logic to delete the prize data on db, placeholder for now
  try{
      // Update the modal state
      setIndex(index);
      const user = await get_current_user(); 
      const success = await redeem_prize(user.id, prizes[index].id);
        if (success) {
            console.log('Prize Redeemed successfully');
            setIsRedeemedModalOpen((prev) => { 
              const newState = [...prev]; // Create a new array 
              newState[index] = true; // Set the modal state for the selected index to true
              return newState;
            });
        }

      setConfirmRedemptionModalOpen((prev) => { 
        const newState = [...prev]; // Create a new array 
        newState[index] = false; // Set the modal state for the selected index to true
        return newState;
    });

    if(!success){
      toast({
        title: "Redemption Error",
        description: "Not enough points",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    }

  }catch (error) {
      console.error("Error occurred during form submission:", error); 
  }
};

const handleOpenItemDetailModal = (index) => {
  setIndex(index);
  setItemDetailModalOpen((prev) => {
    const newState = [...prev];
    newState[index] = true;
    return newState;
  });
};

const handleCloseItemDetailModal = (index) => {
  const newState = [...itemDetailModalOpen];
  newState[index] = false;
  setItemDetailModalOpen(newState);
};

const handleSearch = (newSearchTerm) => {
  setSearchTerm(newSearchTerm.toLowerCase());

  // Filter courses based on the new search term and selected period
  const filteredBySearch = prizes.filter(prize =>
    prize.name.toLowerCase().startsWith(newSearchTerm.trim().toLowerCase()) 
  ); 
  setDisplayedPrizes(filteredBySearch);
};

const handleSelectItem = (prize) => {
  setSelectedPrize(prize); 
  setDisplayedPrizes([prize]);
}; 

//Place in variable to allow reuse for the staff/non-staff layouts
const renderPage = (
  <>
    <Box margin="auto" w="90%" h="fit-content"  backgroundColor="white" align="center" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }} >
      <Box align="center">
        {userType === "adminDemo" &&(
              <div style={{backgroundColor: "#AC2121", color: "white", fontWeight: "bold"}}>To prevent the removal of essential data for demonstration, please note that the admin demo account can only edit and delete prizes that it has specifically added.</div>
            )}

          <div className="page-title">Available Prizes</div>
          <div style={{marginBottom: "10px", width:"80%", mx:"auto"}}>
              <AutocompleteSearchBar searchType="prize" onSelectItem={handleSelectItem} onSearch={handleSearch}></AutocompleteSearchBar>
          </div>

          {(userType === "admin" || userType === "adminDemo") && (
            <div style={{textAlign: "right", marginBottom: "10px", marginRight: "20px"}} >
              <Button colorScheme="teal" onClick={handleAddPrizeClick} padding="7px" pt="0px" pb="0px" >Add Item</Button>
            </div>
          )}
          <Flex flexDirection="row" justifyContent="space-around" flexWrap="wrap" w="100%" px= {{base: "0", md: "3", }}  >
            {displayedPrizes.map((data, index) => (
              <Box key={index} mx={2} >
                <CardItem data={ data } userType={ userType } handleOpenItemDetailModal={() => handleOpenItemDetailModal(index)} handleEditPrizeClick={() => handleEditPrizeClick(index)} handleDeletePrizeClick={() => handleDeletePrizeClick(index)} handleRedeemPrizeClick={() =>handleRedeemPrizeClick(index)}></CardItem>
                <Spacer height={2} />
                <ItemDetailModal isOpen={itemDetailModalOpen[index]} onClose={() =>handleCloseItemDetailModal(index)} prizeData={data} userType={userType} handleDelete={() => handleDeletePrizeClick(index)} handleEdit={() => handleEditPrizeClick(index)} handleRedeem={() => handleRedeemPrizeClick(index)}/>

                {/*Action Modals*/}
                <EditPrizeModal isOpen={isEditPrizeModalOpen[index]} prizeData={data} onClose={() => handleCloseEditPrizeModal(index) } mode="edit-prize" userType={userType} onEditPrize={fetchPrizes}/>
                <ConfirmDeleteModal isOpen={isConfirmDeleteModalOpen[index]} prizeName={data.name} onClose={() => handleCancelDelete(index)} onConfirm={() => handleConfirmDelete(index)}/>
                <ConfirmRedemptionModal isOpen={isConfirmRedemptionModalOpen[index]} prizeName={data.name} cost={data.cost} onClose={() => handleCancelRedeem(index)} onConfirm={() => handleConfirmRedeem(index)}></ConfirmRedemptionModal>
                <SuccessModal isOpen={isDeletedModalOpen[index]} onClose={() => handleCloseDeletedModal(index)} name={ data.name }  mode="delete-prize"></SuccessModal>
                <SuccessModal isOpen={isRedeemedModalOpen[index]} onClose={() => handleCloseRedeemSuccessModal(index)} name={ data.name }  mode="redeem-prize"></SuccessModal>
              </Box>
            ))}
          </Flex>

          {/* AddprizeModal */}
          <EditPrizeModal isOpen={isAddPrizeModalOpen} prizeData={null} onClose={() => setAddPrizeModalOpen(false)} mode="add-prize" onAddPrize={fetchPrizes} userType={userType}/>
          </Box>
         </Box>
  </>
);

  return (
      <Box className="merit-container" align="center" width="100%" mx="auto" h="fit-content" backgroundImage="linear-gradient(180deg, #b8fcf6, #4adfe2 70%, #2fccbc 90%)">
        
        {/*if user is staff use the tab layout*/}
        {userType === "staff" && (
        <Tabs isFitted style={tabsContainerStyle} defaultIndex={1} backgroundColor="white" w="90%" align="center">
          <TabList >
              <Link to="/leaderboard" style={{width: '50%'}}><Tab onclick={handleTabClick}>Leaderboard</Tab></Link>
              <Link to="/merit-shop" style={{width: '50%'}}><Tab>Merit Shop</Tab></Link>
          </TabList>

          <TabPanels >
            <TabPanel></TabPanel> 
            <TabPanel width="100%">
              <>
              {renderPage}
              </>
            </TabPanel>
          </TabPanels>
        </Tabs>
        )}

        {userType !== "staff" && (
          <Box w="100%">{renderPage}</Box>
        )}   

      </Box>         
  );
}

const ConfirmDeleteModal = ({ isOpen, onClose, prizeName, onConfirm }) => {
  return (
      <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent align="center" width="xl">
              <ModalHeader color="white" backgroundColor="#E53E3E" borderRadius="md">Confirm Deletion</ModalHeader>
              <ModalCloseButton color="white"/>
              <ModalBody align="center">
                  Are you sure you want to remove {prizeName} from the shop?
                  This action is <span style={{fontWeight: "bold"}}>irreversible</span>.
              </ModalBody>
              <ModalFooter alignItems="center" borderRadius="md">
                  <Button colorScheme="gray" onClick={onClose}>Cancel</Button>
                  <Button colorScheme="red" onClick={onConfirm}>Confirm Delete</Button>
              </ModalFooter>
          </ModalContent>
      </Modal>
  );
};

const ConfirmRedemptionModal = ({ isOpen, onClose, prizeName, cost, onConfirm }) => {
  return (
      <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent align="center" width="xl">
              <ModalHeader color="white" backgroundColor="#4FD1C5" borderRadius="md">Confirm Redemption</ModalHeader>
              <ModalCloseButton color="white"/>
              <ModalBody align="center">
                  Are you sure you want to redeem {prizeName} for {cost} points?
              </ModalBody>
              <ModalFooter alignItems="center" borderRadius="md">
                  <Button colorScheme="gray" onClick={onClose}>Cancel</Button>
                  <Button colorScheme="teal" onClick={onConfirm}>Redeem</Button>
              </ModalFooter>
          </ModalContent>
      </Modal>
  );
};

const ItemDetailModal = ({ isOpen, onClose, prizeData, userType, handleEdit, handleDelete, handleRedeem }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" w="90%">
      <ModalOverlay />
      <ModalContent >
        <ModalHeader borderRadius="md" color="white" backgroundColor="#4FD1C5" textAlign="center" fontSize="2rem" marginBottom="1px black solid" px={{ base: 4, md: 4 }} py={{ base: 2, md: 4 }}>{prizeData.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={{ base: 2, md: 4 }} py={{ base: 1, md: 2 }}>
          <Flex direction={{ base: "column", md: "row" }}>
            <Box w={{ base: "70%", md: "50%" }} mx="auto" my="auto" >
              <Image src={prizeData.img_url || "./img.svg"} alt={prizeData.name} onClick={handleImageClick} cursor="pointer"/>
            </Box>
              
            <Card mt={{ base: 1, md: 3 }} w={{ base: "100%", md: "50%" }} p={0}>
              <CardHeader m="auto" py={{base: 1, md:3}} fontSize="lg" fontWeight="bold">{prizeData.name} Details</CardHeader>
              <CardBody px={{ base: 6, md: 4 }} py={{ base: 2, md: 4 }}>
                <Text fontWeight="bold">Cost: <Box as="span" ml={7}>{prizeData.cost} points</Box></Text>
                <Text fontWeight="bold" mt={3}>Description: <br/> <Box ml={5} p="3">{prizeData.desc}</Box></Text>
                <Text textAlign="right" mt={3}>{prizeData.type} item</Text>
              </CardBody>
            </Card>
          </Flex>
        </ModalBody>
        <ModalFooter borderRadius="md" backgroundColor="#4FD1C5" w={{base: "100%"}} textAlign="center" px={{ base: 2, md: 4 }} py={1}>
          <Box textAlign="center"> 
              {userType === "student" && <Button colorScheme="teal" onClick={handleRedeem} >Redeem Prize</Button>}
              {userType === "staff" && <Button colorScheme="teal" onClick={onClose}>Close</Button>}
              {(userType === "admin" || (userType === "adminDemo" && prizeData.demo)) && (
                <>
                  <Button colorScheme="teal" onClick={handleEdit}>Edit</Button>
                  <Button colorScheme="red" onClick={handleDelete}>Delete</Button>
                </>
              )} { (userType === "adminDemo" && !prizeData.demo) && (
                // Disable buttons if user is adminDemo but itemDemo=false
                <>
                  <Button colorScheme="teal" onClick={handleEdit} isDisabled={userType === "adminDemo"}>Edit</Button>
                  <Button colorScheme="red" onClick={handleDelete} isDisabled={userType === "adminDemo"}>Delete</Button>
                </>)}
            </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}