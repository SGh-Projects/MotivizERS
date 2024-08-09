import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Avatar, Button, InputGroup, IconButton, Textarea, Input, Select, useToast, FormControl, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useBreakpointValue  } from "@chakra-ui/react";
import { MinusIcon, AddIcon } from '@chakra-ui/icons';
import SearchBar from './../components/SearchBar.jsx';
import { awardPointsToStudent } from '../controllers/Staff.jsx';
import { get_current_user } from '../controllers/Auth.jsx';
import { useParams } from 'react-router-dom';
import { get_student_by_id } from '../controllers/Student.jsx';

const AssignPoints = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [points, setPoints] = useState(0);
  const [selectedReason, setSelectedReason] = useState("");
  const [commentValue, setCommentValue] = useState("");
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalWidth = useBreakpointValue({ base: "95%", md: "75%", lg: "60%" });
  const { studentId } = useParams(); // Accessing URL parameter

  useEffect(() => {
    const fetchStudentById = async () => {
      if (studentId) {
        try {
          const student = await get_student_by_id(studentId);
          setSelectedStudent(student);
        } catch (error) {
          console.error('Error fetching student details:', error);
        }
      }
    };
  
    fetchStudentById();
  }, [studentId]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudent && points > 0 ) {
      const user = await get_current_user()
      // Call awardPointsToStudent function to award points
      const response = await awardPointsToStudent(user.id, selectedStudent.id, points, selectedReason, commentValue);
      if (response.status === 200) {
        setIsModalOpen(true);
      } 
      else { 
        toast({
          title: "Error",
          description: `${response.body} `,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      }
    } else {
      if(!selectedStudent){
        toast({
          title: "Error",
          description: "Please select a student.",
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
      }
      if(points <= 0){
        toast({
          title: "Error",
          description: "Enter Points greater than 0",
          status: "error",
          position: "top-right",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handlePointsChange = (amount) => {
    setPoints(prevPoints => prevPoints + amount);
  };

  const handleCommentChange = (e) => {
    setCommentValue(e.target.value);
  };

  const handleCloseModal = async() => {
    setSelectedStudent(null);
    setPoints(0);
    setSelectedReason("");
    setCommentValue("");
    setIsModalOpen(false);
    const user = await get_current_user()

    toast({
      title: "Award Points Success",
      description: `Available Points Decreased To: ${user.current_pts}`,
      status: "info",
      duration: 8000,
      position: "top-right",
      isClosable: true,
    });
  };

  const handleSearch = ( ) => {  
    //console.log("default")
  };


  return (
    
    <Box mt={3} margin="auto" width="90%" backgroundColor="white" mx="auto" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
      <Box maxWidth="1000px" mx="auto">
      <div className="page-title">Assign Points To Student</div>
      <Text fontSize="0.9em">Search a student's name or ID to get started </Text>
      
      <SearchBar searchType="student" onSelectItem={handleSelectStudent} onSearch={handleSearch}/>

      <Box mt={4} border="1px solid gray.300" margin="10px" width="100%">
        <h2 style={{ textAlign: 'center' }}>Selected Student:</h2>
        <Box border="1px solid" borderColor="gray.300" p={3} mb={1} bg="gray.100" borderRadius="md" textAlign="center">
          {selectedStudent ? (
            <Flex align="center">
              <Box mr={4} ml={2}>
                <Avatar src={selectedStudent.img_url} name={selectedStudent.first_name + ' ' + selectedStudent.last_name} size="sm" />
              </Box>
              <div>
                <Text fontSize="md" fontWeight="bold">{selectedStudent.first_name + ' ' + selectedStudent.last_name}</Text>
                <Text fontSize="sm">Student ID: {selectedStudent.id}</Text>
              </div>
            </Flex>
          ) : (
            <Text fontSize="sm" fontStyle="italic">No student selected</Text>
          )}
        </Box>
      </Box>
  
      <form onSubmit={handleSubmit} >
    <Box margin="10px" mt={10}>
    <Flex className="points-input-field" align="center" >
      <FormControl isRequired display="inline-flex" flexDirection={{ base: "column", md: "row" }} alignItems="center">
        <FormLabel align="left" mr={2} mb={{ base: 2, md: 0 }} width={{ base: "100%", md: "140px" }}>
          Enter Points:
        </FormLabel>
        <div style={{ display: "inline-flex"}}>
          <IconButton aria-label="Decrease points" icon={<MinusIcon />} onClick={() => handlePointsChange(-1)} size="sm" mr={1} isDisabled={points === 0} />
          <InputGroup size="sm" w="120px">
            <Input type="number" value={points === 0 ? '' : points} placeholder="0" onChange={(e) => setPoints(isNaN(parseInt(e.target.value)) ? 0 : Math.max(parseInt(e.target.value), 0))} required />
          </InputGroup>
          <IconButton aria-label="Increase points" icon={<AddIcon />} onClick={() => handlePointsChange(1)} size="sm" />
        </div>
      </FormControl>
    </Flex>



      <Flex className="reason-dropdown" align="center" mt={5}>
        <FormControl isRequired display="inline-flex" flexDirection={{ base: "column", md: "row" }} alignItems="center">
          <FormLabel align="left" width={{ base: "100%", md: "140px" }} mr={2} mb={{ base: "2", md: "2" }}>
            Enter Reason:
          </FormLabel>
          <Select placeholder="Select an option" value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)} w="fit-content" mb={{ base: 2, md: 0 }} required>
            <option value="course participation">Course Participation</option>
            <option value="extracurricular">Extracurricular</option>
            <option value="good conduct">Good Conduct</option>
            <option value="volunteering">Volunteering</option>
          </Select>
        </FormControl>
      </Flex>

      <Flex className="comment-area" align="center" mt={5}>
        <FormControl display="inline-flex" flexDirection={{ base: "column", md: "row" }} alignItems="center">
          <FormLabel align="left" width={{ base: "100%", md: "160px" }} mb={{ base: 2, md: 2 }} mr={2}>
            Enter Comments <span style={{ color: "#999" }}>(optional)</span> :
          </FormLabel>
          <Textarea
            value={commentValue}
            onChange={handleCommentChange}
            placeholder="Enter your comments here..."
            size="md"
            resize="both"
            style={{ width: '100%' }}
          />
        </FormControl>
      </Flex>
    </Box>
    <Button type="submit"  colorScheme="teal" mt={10} margin="auto" display="block">
      Finish
    </Button>
  </form>
  
  {/* Modal */}
    <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent align="center" width={modalWidth}>
          <ModalHeader backgroundColor="#4FD1C5" color="white">Points Awarded Successfully</ModalHeader>
          <ModalCloseButton />
          <ModalBody align="center">
            Successfully awarded {points} points to {selectedStudent?.first_name + " " + selectedStudent?.last_name} for {selectedReason}.
          </ModalBody>
          <ModalFooter alignItems="center">
            <Button colorScheme="teal" onClick={handleCloseModal}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
    </Box>
  );
};  
export default AssignPoints;