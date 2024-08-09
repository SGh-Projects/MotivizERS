import { Box, Spacer, Text, Divider, Button, Flex, FormControl, FormLabel, Select, Avatar } from "@chakra-ui/react";
import { Link, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import { IoIosArrowForward } from 'react-icons/io';

import CardStat from '../components/CardStat'
import { TopEarnerCard } from '../components/CardRank'
import * as preset from '../components/preset'
import SearchBar from '../components/SearchBar'
import AddPrizeModal from '../components/EditPrizeModal'
import AddCourseModal from '../components/EditCourseModal'
import { get_staff_points_breakdown } from "../controllers/Staff";
import { get_current_user } from "../controllers/Auth";
import { get_user_courses } from "../controllers/Course";
import { get_staff_top_earners } from "../controllers/Staff";
import AddStudentModal from '../components/AddStudentModal';
import AddStaffModal from '../components/AddStaffModal';
import AddAdminModal from '../components/AddAdminModal';

import AddUserCsvModal from '../components/AddUserCsvModal';
import AddCourseCsvModal from "../components/AddCourseCsvModal";
import EnrollCsvModal from "../components/EnrollCsvModal";

export default function UserDashboard({userType}) {
  const navigate = useNavigate()
  const [searchBy, setSearchBy] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [AddPrizeOpen, setAddPrizeOpen] = useState(false);
  const [onCourseUpdated, setAddCourseOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addLecturerOpen, setAddLecturerOpen] = useState(false);
  //const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  //add user by csv
  const [addUsersCsvOpen, setUsersCsvOpen] = useState(false);

  //add course by csv
  const [addCoursesCsvOpen, setCoursesCsvOpen] = useState(false);

  //enroll via csv
  const [enrollCsvOpen, setEnrollCsvOpen] = useState(false);

  const styCont = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const styLeaderboardText = {
    display: 'flex',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: preset.colorFontLabel,
    marginTop: '20px',
  };

  const styLeaderboard = {
    display: 'flex',
    flexDirection: 'column',
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto'
  };

  const handleManageCourseClick = (event) => {
    event.stopPropagation();
    navigate(`/course-page`);
};
  const handleManageUsersClick = (event) => {
    event.stopPropagation();
    navigate("/users");
  };
  const handleManageShopClick = (event) => {
    event.stopPropagation();
    navigate(`/merit-shop`);
  };

  const handleSearchChange = (event) => {
    setSearchBy(event.target.value); 
  };

  const handleAddPrizeClick = () => {
    setAddPrizeOpen(true);
  };

  const handleAddCourseClick = () => {
    setAddCourseOpen(true);
  };

  const handleAddStudentClick = () => {
    setAddStudentOpen(true);
  };

  const handleAddStaffClick = () => {
    setAddStaffOpen(true);
  };

  const handleAddAdminClick = () => {
    setAddAdminOpen(true);
  };

  const handleAddUserCsvClick = () => {
    setUsersCsvOpen(true);
  };

  const handleAddCoursesCsvClick = () => {
    setCoursesCsvOpen(true);
  }

  const handleEnrollCsvClick = () => {
    setEnrollCsvOpen(true);
  }
  
  

  const fetchCourses = async () => {
    let fetchedCourses = [];
    if (userType === "student" || userType === "staff") {
      const user = await get_current_user();
      fetchedCourses = await get_user_courses(user.id);
    }
    setCourses(fetchedCourses.body || []);
  };

  const fetchTopEarners = async () => {
    let fetchedStudents = [];
    if (userType === "staff"){
      const user = await get_current_user(); 
      fetchedStudents = await get_staff_top_earners(user.id);
      console.log(fetchedStudents) 
    }
    setStudents(fetchedStudents.body)
  }

  const handleCourseClick = (course) => {
    if(userType === "student"){
      navigate(`/course-students/${course.id}`, { state: { data: course } });}
  };

  useEffect(() => {
    if(userType === "student"){
      fetchCourses();
    }
    if(userType === "staff"){
      fetchTopEarners();
    }
  }, [userType]);

  const handleSelectItem = (item) => {
    if(searchBy === "staff" || searchBy === "student"){
      navigate(`/profile-page/${item.id}`, { state: { data: item } })
    }else{ 
      navigate(`/course-page/${item.id}`, { state: { data: item } })
    }
  };

  if (userType === 'admin') {
    return (
      <Box width={{base: "100%", md: "90%"}} backgroundColor="white" mx="auto" height="100%" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
        <Text className="page-title" textAlign="center">Admin Tools</Text>
        <Flex my="2" width="90%" mx="auto" justifyContent="center">
          <Box  width="60%" textAlign="right" justifyContent="right" >
            <SearchBar searchType={searchBy} onSelectItem={handleSelectItem}/>
          </Box>
          <FormControl width="fit-content" ml="10px" mt='3' justifyContent="left">
            <Select value={searchBy} onChange={handleSearchChange} width="fit-content" marginBottom="20px">
            <option value="" disabled hidden>Search by</option>
              <option value="course">Course</option>
              <option value="staff">Lecturers</option>
              <option value="student">Student</option>
            </Select> 
          </FormControl>
        </Flex>


        <Text fontWeight="bold" fontSize="lg" mt="20px" textAlign="center">Manage Courses</Text>
        <Box py="20px" marginTop="20px" textAlign="center" border="2px solid teal"   borderRadius="15px" maxWidth="90%" width={{base: "90%", md:"50%"}} m="auto" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" bg="teal.50">
          <Flex direction="row" mx="auto" justifyContent="center" align="center" mt="5">
            <Button colorScheme="teal" onClick={handleManageCourseClick}>Go to Courses <IoIosArrowForward/></Button>
            <Button colorScheme="teal" onClick={handleAddCourseClick} >Add Course</Button> {/*Function to be added */}
            <AddCourseModal isOpen={onCourseUpdated} courseData={null} onClose={() => setAddCourseOpen(false)} mode="add-course" />
            
            <Button colorScheme="teal" onClick={handleAddCoursesCsvClick} >Add via CSV</Button> {/*Function to be added */}
            <AddCourseCsvModal isOpen={addCoursesCsvOpen} onClose={() => setCoursesCsvOpen(false)}></AddCourseCsvModal>

            <Button colorScheme="teal" onClick={handleEnrollCsvClick} >Enroll via CSV</Button> {/*Function to be added */}
            <EnrollCsvModal isOpen={enrollCsvOpen} onClose={() => setEnrollCsvOpen(false)}></EnrollCsvModal>

          </Flex>
          

        </Box>

        <Text fontWeight="bold" fontSize="lg" mt="20px" textAlign="center">Manage Merit Shop</Text>
        <Box marginTop="20px" textAlign="center" border="2px solid teal" py="20px" borderRadius="15px" maxWidth="90%" width={{base: "90%", md:"50%"}} m="auto" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" bg="teal.50">
          <Button colorScheme="teal" onClick={handleManageShopClick}>Go to Merit Shop <IoIosArrowForward/></Button>
          <Button colorScheme="teal" onClick={handleAddPrizeClick}>Add Prize</Button>
          <AddPrizeModal isOpen={AddPrizeOpen} prizeData={null} onClose={() => setAddPrizeOpen(false)} mode="add-prize" />
        </Box>

        <Text fontWeight="bold" fontSize="lg" mt="20px" textAlign="center">A New User</Text>
        <Box marginTop="20px" textAlign="center" border="2px solid teal" py="20px" borderRadius="15px" maxWidth="90%" width={{base: "90%", md:"50%"}} m="auto" boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)" bg="teal.50">
        <Flex direction="row" justifyContent="center" mx="auto" align="center" mt="5">
          <Button colorScheme="teal" mb="4" onClick={handleAddStudentClick}>Add Student</Button>
          <AddStudentModal isOpen={addStudentOpen} onClose={() => setAddStudentOpen(false)} />

          <Button colorScheme="teal" mb="4" onClick={handleAddStaffClick}>Add Staff</Button>
          <AddStaffModal isOpen={addStaffOpen} onClose={() => setAddStaffOpen(false)} />

          <Button colorScheme="teal" mb="4" onClick={handleAddAdminClick}>Add Admin</Button>
          <AddAdminModal isOpen={addAdminOpen} onClose={() => setAddAdminOpen(false)} />

          <Button colorScheme="teal" mb="4" onClick={handleAddUserCsvClick}>Add via CSV</Button>
          <AddUserCsvModal isOpen={addUsersCsvOpen} onClose={() => setUsersCsvOpen(false)}></AddUserCsvModal>
        </Flex>
      </Box>
      </Box>

      
    );
  }

  if (userType === 'staff'){
    return (
    <Box width={{base: "100%", md: "90%"}} backgroundColor="white" mx="auto" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
      <Spacer height="10px" />
      <div className="page-title">My Dashboard</div>

      <Flex flexDirection={{base: "column", md: "row"}} flexWrap="wrap" mx="auto" w="90%" justifyContent="space-around">
        <Box sx={styCont} w={{base: "90%", md: "40%"}} mx="auto" flexDirection="column">
          <Text sx={styLeaderboardText}>My Stats</Text>
          <CardStat userType={userType}></CardStat> 
        </Box>
  
        <Box w={{base: "90%", md: "60%"}} mx="auto" flexDirection="column">
          <Text sx={styLeaderboardText}>Top Earners</Text>
          <Text>See the top earner from each of your courses.</Text>

          <Spacer height={4} />      
          <Box sx={styLeaderboard} >
            {Array.isArray(students) && students.length > 0 ? (
              students.map((data, index) => (
                <Box py="5px" width="100%" key={index}>
                  <TopEarnerCard data={data}></TopEarnerCard>
                </Box>
              ))
            ) : (
              <Text>No top earners</Text>
            )}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
  }

  if (userType === 'student'){
    return (
    <Box width={{base: "100%", md: "90%"}} backgroundColor="white" mx="auto" height="100%" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
      <Spacer height="10px" />
      <div className="page-title">My Dashboard</div>
      <Divider borderColor="teal.200" w="80%" mx="auto"/>
      <Flex flexDirection={{base: "column", md: "row"}} flexWrap="wrap" mx="auto" w="100%" justifyContent="space-around">
        <Box sx={styCont} w={{base: "90%", md: "40%"}} mx="auto" flexDirection="column">
          <Text sx={styLeaderboardText}>My Stats</Text>
          <Spacer height={4} />
          <Box sx={styLeaderboard}>
            <CardStat userType={userType}></CardStat>
          </Box>
        </Box>
        
        <Box w={{base: "90%", md: "60%"}} mx="auto">
            <Text sx={styLeaderboardText}>My Courses</Text>
            <Spacer height={4} />      
            <Box sx={styLeaderboard}>
            <Flex direction="row" flexWrap="wrap">
            {courses && courses.length > 0 ? (
              courses.map(course => (
                // go to course student page on click
                <Box key={course.id} py={3} px={2} shadow="md" borderWidth="1px" borderRadius="lg" _hover={{ boxShadow: "xl", cursor: "pointer" }} onClick={() => handleCourseClick(course)}>
                  <Flex alignItems="center" gap={2}>
                    <Box flexShrink={0} ml="1">
                      <Avatar name={course.name} borderRadius="full" boxSize="60px" src={course.img_url} alt={course.name} />
                    </Box>
                    <Box> 
                      <Box textAlign="right" fontSize="12px">{course.period}</Box>
                      <Box flex="1" textAlign="center">
                        <Text fontSize="md" fontWeight="bold">{course.name}</Text>
                        <Text fontSize="small" mt={1}>{course.code}</Text>
                      </Box>
                    </Box>
                  </Flex>
                </Box>
              ))
            ) : (
              <Text>No courses</Text>
            )}
            </Flex>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
  }
}