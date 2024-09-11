
import { useBreakpointValue,Tabs, Box, Divider, Select, FormControl, FormLabel, Spacer, Flex, Modal,TabList, Tab, TabPanel, TabPanels, Avatar, Button, ButtonGroup, ModalBody, Text, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay} from "@chakra-ui/react";
import { useLocation, Link, useNavigate, useParams} from 'react-router-dom';
import CardStudentSnip from '../components/CardStudentSnip';
import SearchBar from './../components/SearchBar'; 
import React, { useState, useEffect } from 'react'; 
import { get_course_students, get_course_lecturer } from "../controllers/Course";
import { get_student_rank } from "../controllers/Student";
import AllPointLogsModal from "../components/AllPointLogsModal";
import AllRedeemLogsModal from "../components/AllRedeemLogsModal";


const CourseStudent = ({userType}) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [sortBy, setSortBy] = useState('accumulatedPoints');
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const [index, setIndex] = useState(0);
  const courseData = location.state && location.state.data;
  const [students, setStudents] = useState([]);
  const { courseId } = useParams(); 
  const navigate= useNavigate();
  const [updateTrigger, setUpdateTrigger] = useState(0); // State to trigger updates

  const fetchStudents = async () => {
    try {
        const allStudents = await get_course_students(courseId);
        if (allStudents) { 
          const studentsWithRank = [];
          for (const student of allStudents.body) {
            const rank = await get_student_rank(student.id);
            studentsWithRank.push({ ...student, rank });
          }
          setStudents(studentsWithRank);   
        } else {
            console.log('No students found.');
        }
    } catch (error) {
        // Handle error
        console.error('Error fetching courses:', error);
    }
  };
  
    useEffect(() => {
      const fetchData = async () => {
        await fetchStudents() 
      };
      fetchData();
    }, []);
     // Empty dependency array to run only once  

    useEffect(() => {
         
        const filteredStudents = students.filter(student =>{
          const fullName = `${student.first_name} ${student.last_name}`; 
          return ( 
            fullName.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
            student.id.toLowerCase().startsWith(searchTerm.toLowerCase())
          );
        });

        // Update displayed students whenever sorting criteria or filtering changes
        const sortedArray = sortStudents(filteredStudents, sortBy);
        setDisplayedStudents(sortedArray);
    }, [students, sortBy, searchTerm]);


  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm.toLowerCase());

    // if search term empty, display all students in the sorted order
    if (newSearchTerm.trim() === "") {
        const sortedArray = sortStudents(students, sortBy);
        setDisplayedStudents(sortedArray);
        setSelectedStudent(null);
    } else {
        // filter the students based on the new search term
        const filteredStudents = students.filter(student =>{
          const fullName = `${student.first_name} ${student.last_name}`; 
          return (
            fullName.toLowerCase().startsWith(newSearchTerm.trim().toLowerCase()) ||
            student.id.toLowerCase().startsWith(newSearchTerm.trim().toLowerCase())
          );
        }
        );
        setDisplayedStudents(filteredStudents);
        setSelectedStudent(null);
    }

  };

  // If a student is selected show only that student on the list so staff can see their details and choose to assign points
  // const displayedStudents = selectedStudent ? [selectedStudent] : filteredStudents;
  
  const handleSelectItem = (student) => {
    setSelectedStudent(student); 
    setDisplayedStudents([student]);
  }; 
 

  const [studentDetailModalOpen, setStudentModalOpen] = useState(Array(students.length).fill(false));

  const handleOpenStudentDetailModal = (index) => {
    setIndex(index);
    setStudentModalOpen((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };
  
  
  const handleCloseStudentDetailModal = (index) => {
    const newState = [...studentDetailModalOpen];
    newState[index] = false;
    setStudentModalOpen(newState);
    };

    const handleSortChange = (event, filteredStudents) => {
      setSortBy(event.target.value);
      const sortedArray = sortStudents(filteredStudents, event.target.value);
      setDisplayedStudents(sortedArray);
    };
    
    const sortStudents = (students, sortBy) => {
      // Clone the students to avoid mutating the original array
      const sortedArray = [...students];
  
      // Sorting logic based on the selected option
      switch (sortBy) {
        case 'name':
          sortedArray.sort((a, b) => a.first_name.localeCompare(b.first_name));
          break;
        case 'id':
          sortedArray.sort((a, b) => a.id.localeCompare(b.id));
          break;
        case 'accumulatedPoints':
          sortedArray.sort((a, b) => parseInt(b.accumulated_pts) - parseInt(a.accumulated_pts));
          break;
        default:
          break;
      }
  
      return sortedArray;
    };
    
    const renderPage = (
      <>
        <Box width="100%" mx="auto">
          <h2 className="page-title">{courseData.name}</h2>
          <h2 >{courseData.description}</h2>
          <Divider my={1} w="80%" mx="auto" borderColor="gray.300" />
          <Box width="70%" mx="auto">
            <SearchBar searchType="student" onSelectItem={handleSelectItem} onSearch={handleSearch} courseID={courseData.id}/>
          </Box>
            <Spacer height={2} />
  
          <Flex w="80%" justifyContent="space-between" m="auto" mt="3">
            <FormControl alignItems="center">
              <Flex alignItems="center">
                <FormLabel mr="2" ml="3" align="left">
                  Sort by:
                </FormLabel> 
                <Select value={sortBy} onChange={(event) => handleSortChange(event, displayedStudents)} width="fit-content" marginBottom="20px">
                  <option value="accumulatedPoints">Accumulated Points</option>
                  <option value="id">Student ID</option>
                  <option value="name">Student Name</option>
                </Select>
              </Flex>
            </FormControl>
  
            <Flex alignItems="center">
              <p>{displayedStudents.length}</p>
              <p>&nbsp;students</p> {/*non-breaking space for same line*/}
            </Flex>
          </Flex>
  
            <Flex
              alignItems="center"
              justifyContent="center"
            >
              <Box style={{ width: "80%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {Array.isArray(displayedStudents) && displayedStudents.length > 0 ? (
                displayedStudents.map((student, i) => (
                  <div key={student.id}>
                    <Box>
                      <CardStudentSnip  key={i} data={{ ...student, i}} userType={userType} handleOpenStudentModal={() => handleOpenStudentDetailModal(i)}></CardStudentSnip>
                      <Spacer height={1} />
                    </Box>
                    <StudentDetailModal isOpen={studentDetailModalOpen[i]} onClose={() =>handleCloseStudentDetailModal(i)} userType={userType} studentData={student}></StudentDetailModal>
                  </div>
                ))
              ) : (
                <Text>No students found for this course.</Text> // You can customize the error message as needed
              )}
              </Box>
            </Flex>
      </Box>
      </>
    );

    const goToCourseStudentsPage = () => {
      event.preventDefault();
      navigate(`/course-students/${courseId}`, { state: { data: courseData } });
    };
  
    const goToLecturerTab = () => {
      event.preventDefault();
      navigate(`/admin/course/${courseId}`, { state: { data: courseData } });
    };

    return (
      <Box display='flex' flexDirection='column' height='100%' width={{base: "100%", md: "90%"}} marginX='auto' backgroundColor="white" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>

        {userType !== "admin" || userType !== "adminDemo" && (
          <>
            {renderPage}
          </>
        )}  

        {userType === "admin" || userType === "adminDemo" && (
          <Tabs isFitted variant="enclosed" defaultIndex={1}  backgroundColor="white" >
            
            <TabList>
                <Tab onClick={goToLecturerTab}>Lecturer</Tab>
                <Tab onClick={goToCourseStudentsPage}>Students</Tab> 
            </TabList>

            <TabPanels>
              <TabPanel></TabPanel>
              <TabPanel width="100%">
                <>{renderPage}</>
              </TabPanel>
            </TabPanels>
          </Tabs> 
          )
        }
      </Box>       
    );
  }
  
  export default CourseStudent;
  
  const StudentDetailModal = ({isOpen, onClose, userType, studentData}) => {
    //if the button should be inline based on viewport width
    const buttonInline = useBreakpointValue({ base: false, md: true, lg: true });
    const navigate= useNavigate();
    const [isPointsLogModalOpen, setIsPointsLogModalOpen] = useState(false);
    const [isRedeemLogModalOpen, setIsRedeemLogModalOpen] = useState(false);
    const [staff, setStaff] = useState(null)
    const { courseId } = useParams(); 

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
      const fetchData = async () => {
        await fetchLecturer(); 
      };
      fetchData();
    }, []); // Empty dependency array to run only once  

    // Function to handle opening the points log modal
    const handlePointsByStaffClick = () => {
      setIsPointsLogModalOpen(true);
    };

    // Function to handle closing the points log modal
    const handleClosePointsLogModal = () => {
      setIsPointsLogModalOpen(false);
    };

    // Function to handle opening the redeem log modal
    const handleRedemptionsClick = () => {
      setIsRedeemLogModalOpen(true);
    };

    // Function to handle closing the redeem log modal
    const handleCloseRedeemLogModal = () => {
      setIsRedeemLogModalOpen(false);
    };
  
    const linkStyle = {
      cursor: 'pointer', 
      color: 'teal',
      _hover: {
         color: 'blue',
      },
  };
  
    // action buttons
    const actionButtons = () => { 
      if (userType === 'staff' || userType === "admin" || userType === "adminDemo"){ 
          return(
              <Box className="actionicon" textAlign="right" >
                  <Button colorScheme="teal" marginRight="5px" onClick={(event) => handleAssignPointsClick(studentData.studentid, event)}>
                      Assign Points 
                  </Button>
              </Box>   
          );
      }
      else{  
          <></>
      }
    };
  
    const handleAssignPointsClick = (studentid, event) => {
      event.stopPropagation();
      navigate(`/assign-points/${studentid}`, { state: { data: studentData } });
    };
  
    const handleProfileClick = (studentid, event) => { 
      navigate(`/profile-page/${studentid}`, { state: { data: studentData } });
    };
  
    return(
      <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay/>
        <ModalContent>
        <ModalHeader borderRadius="md" color="white" backgroundColor="#4FD1C5" textAlign="center" fontSize="1.5rem" marginBottom="1px black solid" px={{ base: 4, md: 4 }} py={{ base: 2, md: 4 }}>
          <p>Student Details</p>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex justifyContent="space-between">
            <Flex alignItems="center" >
                <Avatar onClick={(event) =>handleProfileClick(studentData.id, event)} style={{cursor:"pointer"}} src={studentData?.img_url} name={studentData?.first_name + " " + studentData?.last_name} size="md" mr="4" />
                <Box>
                  <Text sx={linkStyle} fontWeight="bold" onClick={(event) =>handleProfileClick(studentData.id, event)}>{studentData.first_name + " " + studentData.last_name}</Text>
                  <Text>Student ID: {studentData.id}</Text>
                </Box>
            </Flex>
                {buttonInline && (
                  <Box textAlign="right">{actionButtons()}</Box>
               )}
            
            </Flex>
            {!buttonInline && (
              <> 
              {actionButtons()} 
              </>
            )}
            <Divider mb="4" mt="2" />
            <Box ml={{ base: "2", md: "4" }} mt="2">
              <Flex textAlign="left">
                <Box minWidth="100px">
                  <Text fontWeight="bold">Current Ranking:</Text>
                  <Text fontWeight="bold">Accumulated Points:</Text>
                  <Text fontWeight="bold">Current Points:</Text>
                </Box>
                <Box ml={{ base: "10%", md: "20%" }}>
                  <Text>{studentData.rank}</Text>
                  <Text>{studentData.accumulated_pts}</Text>
                  <Text>{studentData.current_pts}</Text>
                </Box>
              </Flex>
            </Box>
            <Divider my="4" />
            {userType === 'staff' && (
              <Box>
                <Text fontWeight="bold" textAlign="center">Recent Activity</Text>
                {/* Add recent activity content here */}
                <Text textAlign="center" mt="3">
                  <Button colorScheme="teal" onClick={handlePointsByStaffClick}>See Points Awarded by Me</Button>
                </Text>
              </Box>
            )}

            {userType === 'admin' || userType === "adminDemo" && (
              <Box>
                <Text fontWeight="bold" textAlign="center">Recent Activity</Text>
                {/* Add recent activity content here */}
                <Text textAlign="center" mt="3">
                  <ButtonGroup>
                    <Button colorScheme="teal" onClick={handlePointsByStaffClick}>See Points Awarded by Staff</Button>
                    <Button colorScheme="teal" onClick={handleRedemptionsClick}>See Redemption Logs</Button>
                  </ButtonGroup>
                </Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter borderRadius="md" backgroundColor="#4FD1C5" w={{base: "100%"}} textAlign="center" px={{ base: 2, md: 4 }} py={1}>
            <Button colorScheme="teal" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
        <AllPointLogsModal isOpen={isPointsLogModalOpen} onClose={handleClosePointsLogModal} staffID={staff ? staff.id : null} studentID={studentData.id} />
        <AllRedeemLogsModal isOpen={isRedeemLogModalOpen} onClose={handleCloseRedeemLogModal} studentID={studentData.id}/>
      </>
    );
  }