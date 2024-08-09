import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, useDisclosure, FormControl, FormLabel, Select, Avatar, useToast, useBreakpointValue } from "@chakra-ui/react";
import SearchBar from './../components/SearchBar'; 
import { useNavigate } from 'react-router-dom';
import { get_all_courses, get_user_courses, delete_course } from '../controllers/Course';
import { get_current_user } from '../controllers/Auth';
import EditCourseModal from "../components/EditCourseModal";
import DeleteModal from "../components/DeleteModal";
import CourseSuccessModal from "../components/CourseSuccessModal"; // Import CourseSuccessModal
import EnrollModal from "../components/EnrollModal"; // Import 
import { SiConcourse } from 'react-icons/si';
import {get_students } from '../controllers/Student'
import {get_all_staff} from '../controllers/Staff'


const CoursePage = ({ userType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState([]);
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const { isOpen: isSuccessModalOpen, onOpen: onSuccessModalOpen, onClose: onSuccessModalClose } = useDisclosure(); // Success modal disclosure
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);
  const [allStudents, setAllStudents] = useState([]); 
  const [allStaff, setAllStaff] = useState([]); 
  const [period, setPeriod] = useState('all'); // State for selected period
  const [uniquePeriods, setUniquePeriods] = useState([]); // State for unique periods
  const [currentUser, setUser] = useState(null);

  const generateRandomColor = () => {
    const color = Math.floor(Math.random() * 16777215).toString(16); // Generate a random hexadecimal color
    return `#${color}`;
    };

  const navigate = useNavigate();  

  useEffect(() => {
    fetchCourses();
    fetchAllStudents();
    fetchAllStaff();
}, []);

  const get_user = async () =>{
    const current_user = await  get_current_user(); 
    setUser(current_user)
  }

  useEffect(() => {
    if (Array.isArray(courses)) {  // Check if courses is an array
      const periods = courses.map(course => course.period).filter(Boolean);  // Exclude undefined, null, or falsy values
      const uniquePeriods = [...new Set(periods)];
      setUniquePeriods(uniquePeriods);
    } else {
      console.error("Expected 'courses' to be an array but got:", typeof courses);
    }
  }, [courses]);
  

  useEffect(() => {
    const filteredByPeriod = period === "all" ? courses : courses.filter(course => course.period === period);
    setDisplayedCourses(filteredByPeriod);
  }, [courses, period]);

  const fetchCourses = async () => {
    let fetchedCourses = [];
    try {
        if (userType === "admin") {
            const response = await get_all_courses();
            if (response.status === 200 && Array.isArray(response.body)) {
                setCourses(response.body);
            } else {
                console.error("Error fetching courses:", response);
                setCourses([]); // Set to empty array or handle error differently
                toast({
                    title: "Failed to fetch courses",
                    description: response.body || "Unknown error occurred",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } else {
            const user = await get_current_user();
            if(user) {
                const response = await get_user_courses(user.id);
                if (response.status === 200 && Array.isArray(response.body)) {
                    setCourses(response.body);
                } else {
                    console.error("Error fetching user courses:", response);
                    setCourses([]); // Set to empty array or handle error differently
                    toast({
                        title: "Failed to fetch user courses",
                        description: response.body || "Unknown error occurred",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]); // Set to empty array on error
        toast({
            title: "Network error",
            description: "Failed to fetch courses due to a network error",
            status: "error",
            duration: 5000,
            isClosable: true,
        });
    }
};
 
   const [displayedCourses, setDisplayedCourses] = useState([]); 

  const fetchAllStudents = async () => {
    try {
      const response = await get_students();
      if (response.status === 200 && response.body) {
        setAllStudents(response.body); 
      } else {
        // Handle case where students are not found or an error occurred
        console.error('No students found or error fetching students');
        setAllStudents([]); // Reset or set to an empty array as needed
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      console.log(allStudents);

    }
  };
  useEffect(() => {
    fetchAllStudents();
  }, []); 

const fetchAllStaff = async () => {
    try {
        const response = await get_all_staff();
        if (response.status === 200 && response.body) {
            console.log("Staff Data:", response.body);  // Check what data is received
            setAllStaff(response.body);
        } else {
            console.error('No staff found or error fetching staff');
            setAllStaff([]);
        }
    } catch (error) {
        console.error("Error fetching staff:", error);
        setAllStaff([]);
    }
};
  

  const handleCourseClick = (course) => {
    if(userType === "student" || userType==="staff"){
      navigate(`/course-students/${course.id}`, { state: { data: course } });}
    else if(userType === "admin"){
      navigate(`/admin/course/${course.id}`, { state: { data: course } });
    }
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    onEditModalOpen();
  };

  const handleEnrollLecturerClick = (course) => {
    setSelectedCourseForEnroll(course); 
    setIsEnrollModalOpen(true); // Trigger to open the Enroll Modal
};

  const handleEnrollClick = (course) => {
    setSelectedCourseForEnroll(course);
    setIsEnrollModalOpen(true);
  };
  const handleEnrollStudentToCourse = async (studentId, courseId) => {
    try {
        const result = await enroll(studentId, courseId);
        if (result.success) {
            toast({
                title: 'Enrollment successful',
                description: `The student has been successfully enrolled in ${selectedCourse?.name}.`,
                status: 'success',
                duration: 5000,
                isClosable: true,
            });

            // Re-fetch courses to update the UI
            fetchCourses();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        toast({
            title: 'Enrollment failed',
            description: `Error: ${error.message}`,
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    }
};

  // This function should fetch the updated list of students from the backend
  const fetchUpdatedStudents = async (courseId) => {
    try {
      const updatedStudents = await get_course_students(courseId);
      setCourseStudents(updatedStudents);  
    } catch (error) {
      console.error('Failed to fetch updated student list:', error);
    }
  };

  const handleDeleteCourse = (course) => {
    setSelectedCourse(course); // Store the course to be deleted
    onDeleteModalOpen(); // Open delete confirmation modal
  };
  const handleConfirmDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await delete_course(selectedCourse.id);
      toast({
        title: 'Course deleted',
        description: `The course "${selectedCourse.name}" was successfully deleted.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      await fetchCourses(); // Refresh the list after deletion
      setSelectedCourse(null); // Reset selected course
      onDeleteModalClose(); // Close the delete modal
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'Error',
        description: `Failed to delete the course: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm.toLowerCase());
  
    // Filter courses based on the new search term and selected period
    const filteredBySearch = courses.filter(course =>
      course.name.toLowerCase().startsWith(newSearchTerm.trim().toLowerCase()) ||
      course.code.toLowerCase().startsWith(newSearchTerm.trim().toLowerCase())
    ); 
    setDisplayedCourses(filteredBySearch);
  };
  
  return (
    <Box mt={3} margin="auto" width={{base: "100%", md: "90%"}}  minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }} backgroundColor="white">
      <Box width="90%" mx="auto" maxWidth="1000px">
        <Text mb={2} className='page-title'>{userType === "admin" ? "All Courses" : "My Courses"}</Text>
        <SearchBar searchType="course" onSearch={handleSearch} userID={currentUser ? currentUser.id : null} userType={userType}/>
        <Flex justifyContent="end"  mt={2}>
        {userType === "admin" && (
          <Button onClick={() => setSelectedCourse(null) || onEditModalOpen()} colorScheme="teal" mb={4}>
            Add New Course
          </Button>
        )}
        </Flex>
        <Flex  justifyContent="space-between" m="auto" mt="1">
            <FormControl alignItems="center">
              <Flex alignItems="center">
                <FormLabel mr="2" ml="3" align="left">
                  Period:
                </FormLabel> 
                <Select value={period} onChange={(event) => setPeriod(event.target.value)} width="fit-content" marginBottom="20px">
                <option value="all">All Periods</option>
                {uniquePeriods.map((uniquePeriod, index) => (
                  <option key={index} value={uniquePeriod}>{uniquePeriod}</option>
                ))}
              </Select>
              </Flex>
            </FormControl>
  
            <Flex alignItems="center">
              <p>{displayedCourses.length}</p>
              <p>&nbsp;courses</p> {/*non-breaking space for same line*/}
            </Flex>
          </Flex>
      </Box>
      <Flex
  direction="row" 
  justifyContent="center"
  flexWrap="wrap"
  width="100%"
  maxWidth="1000px"
  mx="auto"
  mt={1}>
  {Array.isArray(displayedCourses) && displayedCourses.length === 0 ? (
    <Text>No courses found.</Text>
  ) : (
    Array.isArray(displayedCourses) && displayedCourses.map(course => (
      <Box key={course.id}
            shadow='0 0px 0px 1px #cfcfcf'
            borderWidth="1px"
            borderRadius="10px" 
            transition= 'transform 0.3s'
            p={1}
            _hover={{ 
                boxShadow: '0 0 4px 2px #f7d086',
                transform: "scale(1.02)", // Slightly increase the size
                cursor: "pointer"    
            }}
              bgGradient='white'
              width={userType === 'admin' ? "280px" : "250px"}
              height={userType === 'admin' ? "fit-content" : "180px"}
              mb={3} mx={2} pt={2}
              display="flex"
              flexDirection="column"
              justifyContent="start"
              gap={3}
              alignItems="start" onClick={() => handleCourseClick(course)}>

                <Flex flexDirection="column" width="95%" height="100%" mx="auto"> 
                {course.img_url ? (
                      <Box height={userType === 'admin' ? "60px" : "60%"} width="100%" borderRadius="10px" bgImage={course.img_url}
                      backgroundPosition="center" backgroundSize="cover" />
                  ) : (
                      <Box 
                          height={userType === 'admin' ? "60px" : "50%"}
                          width="100%"
                          bgColor={generateRandomColor()} // Apply random color
                          borderRadius="10px" 
                          pointerEvents="none"
                      />
                  )}
                  <Box flexGrow={1} ml={2} py={3} cursor="pointer" height={userType === 'admin' ? "30%" : "40%"} m="auto" alignItems="center">
                      <Text fontSize="md" fontWeight="bold" noOfLines={2}>{course.name}</Text>
                      <Text fontSize="sm" noOfLines={1}>{course.code} ({course.period})</Text>  
                  </Box>
                  {userType === "admin" && (
                      <Flex flexDirection="row" width="100%" height="30%" bottom="0">
                          <Button colorScheme="teal" onClick={(e) => {e.stopPropagation(); handleEditCourse(course);}}>Edit</Button>
                          <Button colorScheme="teal" onClick={(e) => {e.stopPropagation(); handleEnrollClick(course);}}>Enroll</Button>
                          <Button colorScheme="red" onClick={(e) => {e.stopPropagation(); handleDeleteCourse(course);}}>Delete</Button>
                      </Flex>
                  )}
                </Flex>
            </Box>

          ))
        )}
      </Flex>
      <DeleteModal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} courseName={selectedCourse?.name} onConfirm={handleConfirmDeleteCourse} />
      <EditCourseModal isOpen={isEditModalOpen} onClose={onEditModalClose} courseData={selectedCourse} onCourseUpdated={fetchCourses} />
      <CourseSuccessModal isOpen={isSuccessModalOpen} onClose={onSuccessModalClose} name={selectedCourse?.name} mode="delete-course" /> {/* Use the success modal for delete confirmations */}
      <EnrollModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        selectedCourse={selectedCourseForEnroll} allStudents={allStudents} handleEnrollStudentToCourse={handleEnrollStudentToCourse} />
      
    </Box>
  );
};

export default CoursePage;
