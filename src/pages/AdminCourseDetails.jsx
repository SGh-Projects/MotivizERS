import React, {useState, useEffect} from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Text, Flex, Menu, MenuButton, MenuList, MenuItem, Divider, useToast, Avatar, Tooltip, Modal, ModalOverlay, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalCloseButton, FormControl, FormLabel, Input} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import CourseStudent from './CourseStudent';
import { useLocation, Link, useNavigate, useParams} from 'react-router-dom';
import { get_course_lecturer } from '../controllers/Course';
import { get_staff_points_breakdown } from '../controllers/Staff';
import PointTypeLogsModal from '../components/PointTypeLogsModal';
import AllPointLogsModal from '../components/AllPointLogsModal';
import { get_current_user } from '../controllers/Auth';
import { allot_points_to_staff } from '../controllers/Admin';
import EnrollModal from "../components/EnrollModal"; // Import 

const AdminCourseDetails = ({ userType }) => {
  const location = useLocation();
  const { courseId } = useParams();
  const [staff, setStaff] = useState(null);
  const courseData = location.state && location.state.data; 
  const [pointsBreakdown, setPointsBreakdown] = useState({
    goodConduct: 0,
    courseParticipation: 0,
    volunteering: 0,
    extracurricular: 0
  });
  const [selectedType, setSelectedType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allLogsModalOpen, setAllLogsModalOpen] = useState(false);
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const navigate = useNavigate();
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollType, setEnrollType] = useState('student');
  

  const styleLink = {
    w: "100%",
    transition: 'transform 0.3s',
    color: 'teal',
    textDecoration: 'underline', 
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '5px', 
    _hover: {
      transform: 'scale(1.03)', 
      backgroundColor: 'teal',
      color: 'white',
      textDecoration: 'underline',  
    },
  };
  const renderTooltipContent = (pointType) => {
    switch (pointType) {
      case 'goodConduct':
        return 'See award logs for good conduct';
      case 'courseParticipation':
        return 'See award logs for participation in the course';
      case 'volunteering':
        return 'See award logs for volunteering activities';
      case 'extracurricular':
        return 'See award logs for extracurricular activities';
      default:
        return '';
    }
  };
  
  const handlePointTypeClick = (type) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedType(null);
    setIsModalOpen(false);
  };

  const handleEnrollClick = (type) => {
    setEnrollType(type);
    setEnrollModalOpen(true);
  };

  const closeEnrollModal  = async () => {
    setEnrollModalOpen(false);
    if(enrollType === "staff"){
      await fetchLecturer(); 
    }
  }; 

  const fetchLecturer = async () => {
    try {
      const response = await get_course_lecturer(courseId);
      if (response.status === 200) { 
        const lecturer = response.body; 
        
        if (lecturer && Array.isArray(lecturer)) { 
          if((lecturer.length) > 0){ 
            setStaff(lecturer[0]);
          }
        } 
      } else {
        console.log('No Lecturer found.');
      }
    } catch (error) {
      // Handle error
      console.error('Error fetching lecturer:', error);
    }
  };
  
  useEffect(() => {
    if (staff) {
      const fetchPointsBreakdown = async () => {
        try {
          const breakdown = await get_staff_points_breakdown(staff.id);
          if(breakdown ){
            setPointsBreakdown(breakdown);
          }
        } catch (error) {
          console.error('Error fetching points breakdown:', error);
        }
      };
  
      fetchPointsBreakdown();
    }
  }, [staff]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchLecturer(); 
    };
    fetchData();
  }, []); // Empty dependency array to run only once  

  const handleTabClick = (event) => {
    // Prevent the default tab switching behavior
    event.preventDefault();
  };

  const goToCourseStudentsPage = () => {
    event.preventDefault();
    navigate(`/course-students/${courseId}`, { state: { data: courseData } });
  };

  const goToLecturerTab = () => {
    event.preventDefault();
    navigate(`/admin/course/${courseId}`, { state: { data: courseData } });
  };

  // Function to handle opening the points log modal
  const seePointsByStaffClick = () => {
    setAllLogsModalOpen(true);
  };

  const handleCloseAllLogsModal = () => {
    setAllLogsModalOpen(false);
  };

  const allotPointsClick = () => {
    setIsAllotModalOpen(true);
  };

  const handleCloseAllotModal = () => {
    setIsAllotModalOpen(false);
  };

  return (
    <Box display='flex' flexDirection='column' height='100%' width='90%' marginX='auto' backgroundColor="white" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
      {userType === "admin" && (
        <>
          <Tabs isFitted variant="enclosed" defaultIndex={0}>
            <TabList>
              <Tab onClick={goToLecturerTab}>Lecturer</Tab>
              <Tab onClick={goToCourseStudentsPage}>Students</Tab> 
            </TabList> 
            <TabPanels>
              <TabPanel>
                <h2 className="page-title" my={1}>{courseData.name}</h2>
                <h2 >{courseData.desc}</h2>
                <Divider my={1} w="80%" mx="auto" borderColor="gray.300" />
                <Text fontSize="xl" fontWeight="bold">Lecturer Information</Text>
                <Flex justifyContent="right" mb="20px" width="95%"> 
                <Menu>
                <MenuButton p={1} bg="blue.100" _hover={{ bg: 'blue.200' }} _focus={{ bg: 'blue.200', outline: 'none' }}>
                  <Text>More Tools <ChevronDownIcon /></Text>
                </MenuButton>
                <MenuList color="teal.500" minWidth="fit-content">
                  <MenuItem onClick={() => handleEnrollClick('student')} fontWeight="bold" _hover={{ bg: 'teal.400', color: 'white' }}>Enroll Particpants </MenuItem>
                </MenuList>
              </Menu>

                </Flex>
                {(staff != null) ? (
                  <>
                <Flex width="100%" flexDirection={{base: "column", md:"row"}} flexWrap="wrap" h="fit-content" justifyContent="space-around">
                  <Box borderWidth="1px" h="100%" borderRadius="lg" p="5" backgroundColor="white" width={{base: "100%", md:"50%", lg:"40%"}}>
                        <Text fontSize="xl" fontWeight="bold">Personal Information</Text>
                        <Divider borderColor="teal.200" />
                        <Flex h="100%" p="20px">
                          <Avatar w="50%" borderRadius="none" h="150px" src={staff.img_url || "./img.svg"} name={staff.first_name} alt="placeholder" />
                          <Box  w="50%" textAlign="left" p="10px" my="auto">
                          <Text><Text fontWeight="bold" display="inline">Name:</Text> {staff.first_name} </Text>
                          <Text><Text fontWeight="bold" display="inline">StaffID:</Text> {staff.id}</Text>
                          <Text><Text fontWeight="bold" display="inline">Email:</Text> {staff.email}</Text> 
                          </Box>
                        </Flex>
                      
                    
                  </Box>
                  <Box borderWidth="1px" borderRadius="lg" p="5" backgroundColor="white" width={{base: "100%", md:"50%", lg:"40%"}}>
                      <Text fontSize="xl" fontWeight="bold">Lecturer Statistics</Text>
                      <Divider borderColor="teal.200" />
                      <Box textAlign="left" p="20px" my="auto" mx="auto" >
                      <Flex m="auto" justifyContent="space-between"flexDirection="column">
                        <Text backgroundColor="teal.100" p="10px"   textAlign="center" fontSize="lg" fontWeight="bold" my="auto">Current Points Balance: {staff && staff.current_pts}/300</Text>
                        <Flex justifyContent="right"  >
                          <Button colorScheme="teal" onClick={allotPointsClick}>Allocate Points</Button>
                          <Button w="fit-content"  colorScheme="teal" onClick={seePointsByStaffClick}>All Activity</Button>
                        </Flex>
                      </Flex>
                        <Divider borderColor="teal.300" mb="10px"/>
                        <Box mx={4}>
                        <Text fontWeight="bold">Points Awarded Breakdown: </Text>
                        <Box w="100%" textAlign="left" pl="10px"  >
                          {pointsBreakdown && (
                            <Box w="100%" textAlign="left" px="10px" my="auto">
                              <Tooltip label={renderTooltipContent('goodConduct')}  placement="top">
                                <Text sx={styleLink} onClick={() => handlePointTypeClick('goodConduct')}>
                                  <Text fontWeight="bold" display="inline">Good Conduct:</Text> {pointsBreakdown.goodConduct} points
                                </Text>
                              </Tooltip>
                              <Tooltip label={renderTooltipContent('courseParticipation')} placement="top">
                                <Text sx={styleLink} onClick={() => handlePointTypeClick('courseParticipation')}>
                                  <Text fontWeight="bold" display="inline">Course Participation:</Text> {pointsBreakdown.courseParticipation} points
                                </Text>
                              </Tooltip>
                              <Tooltip label={renderTooltipContent('volunteering')} placement="top">
                                <Text sx={styleLink} onClick={() => handlePointTypeClick('volunteering')}>
                                  <Text fontWeight="bold" display="inline">Volunteer:</Text> {pointsBreakdown.volunteering} points
                                </Text>
                              </Tooltip>
                              <Tooltip label={renderTooltipContent('extracurricular')} placement="top">
                                <Text sx={styleLink} onClick={() => handlePointTypeClick('extracurricular')}>
                                  <Text fontWeight="bold" display="inline">Extracurricular:</Text> {pointsBreakdown.extracurricular} points
                                </Text>
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      </Box>
                  </Box>
                </Flex>
                </>
              ) : (
                <Text>No staff member has been assigned as a lecturer of this course.</Text>
              )}
              </TabPanel>
              <TabPanel>
                
              </TabPanel>
            </TabPanels>
          </Tabs>
          <PointTypeLogsModal isOpen={isModalOpen} onClose={handleCloseModal} type={selectedType} userID={staff ? staff.id : null}  points={selectedType ? pointsBreakdown[selectedType] || 0 : 0}/>

        </>
      )}
      <AllPointLogsModal isOpen={allLogsModalOpen} onClose={handleCloseAllLogsModal} staffID={staff ? staff.id : null} />
      <AllotPointsModal isOpen={isAllotModalOpen} onClose={handleCloseAllotModal} staff={staff} fetchLecturer={fetchLecturer} />
      <EnrollModal
        isOpen={enrollModalOpen}
        onClose={closeEnrollModal}
        selectedCourse={courseData}
        personType={enrollType}
      />
    </Box>
  );
};

export default AdminCourseDetails;



const AllotPointsModal = ({ isOpen, onClose, staff, fetchLecturer }) => {
  const [points, setPoints] = useState(0);
  const toast = useToast();
  const maxPoints = 300 - (staff && staff.current_pts);

  const handleChange = (e) => {
    const { value } = e.target;
    setPoints(value);
    if(value > maxPoints){
      setPoints(maxPoints)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (points > 0) {
      try {
        const user = await get_current_user();
        if (user) { 
          const response= await allot_points_to_staff(staff.id, user.id, points);
          console.log(response)
          if(response.status === 200){
            toast({
              title: "Success",
              description: `${points} points allotted to ${staff.first_name} ${staff.last_name} `,
              status: "success",
              duration: 3000,
              position: "top-right",
              isClosable: true,
            });
            fetchLecturer();
          }else{
            toast({
              title: "Error",
              description: `${response.body} `,
              status: "error",
              duration: 3000,
              position: "top-right",
              isClosable: true,
            });
          } 
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    } else {
      console.log("Points must be greater than 0.");
      toast({
        title: "Error",
        description: `Points must be greater than 0.`,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    }
    
    // Reset points after submission
    setPoints(0);
    onClose();
  };

  const handleMaxPointsClick = () => {
    // Set points to the maximum allowed
    setPoints(maxPoints);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader backgroundColor="teal.300" color="white" textAlign="center">Allocate Points</ModalHeader>
        <ModalCloseButton />
        <ModalBody textAlign="center">
          Points Entered will be added to the staff's total. <strong>Maximum Balance is 300.</strong> <br/><strong>Staff's Current Balance:</strong> {staff && staff.current_pts} points
          <form onSubmit={handleSubmit}>
            <FormControl  p="20px">
              <FormLabel>Enter Points</FormLabel>
              <Input type="number" onChange={handleChange} value={points === 0 ? '' : points} placeholder="0" required />
            </FormControl>
            <Button mt={4} colorScheme="teal" onClick={handleMaxPointsClick}>
            Allot Max Points
          </Button>
            <Button mt={4} colorScheme="teal" type="submit">
              Allocate Points
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};