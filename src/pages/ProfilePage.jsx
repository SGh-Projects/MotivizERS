import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Input, Avatar, Heading, useToast, Text
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { get_user_by_id, update_user, get_current_user } from '../controllers/Auth';
import { get_user_courses } from '../controllers/Course';
import { get_student_rank } from '../controllers/Student';
import AllPointLogsModal from '../components/AllPointLogsModal';

const ProfilePage = ({ userType }) => {
  const [profile, setProfile] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    desc: '',
    img_url: '',
    courses: [],
    rank: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwardLogsModalOpen, setIsAwardLogsModalOpen] = useState(false);

  const { userId } = useParams();
  const toast = useToast();

  useEffect(() => {
    async function fetchData() {
      let currentUser = null;
      if (!userId) {
        currentUser = await get_current_user();
      }
      
      if (currentUser) {
        setProfile({
          id: currentUser.id,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          email: currentUser.email,
          desc: currentUser.desc,
          img_url: currentUser.img_url,
          courses: []
        });

        const coursesResponse = await get_user_courses(currentUser.id);
        if (coursesResponse.status === 200) {
          setProfile(prev => ({ ...prev, courses: coursesResponse.body }));
        }
      } else if (userId) {
        const user = await get_user_by_id(userId);
        if (user) {
          let rank;
          if(user.role === 'student' || user.role === 'studentDemo'){
            rank= await get_student_rank(user.id)
            profile.role= 'student';
          }
          if(user.role === 'staff' || user.role === 'staffDemo'){
            profile.role= 'staff';
          }
          setProfile({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            desc: user.desc,
            img_url: user.img_url,
            accumulated_pts: user.accumulated_pts,
            courses: [],
            rank: rank,
            role: profile.role
          });
          console.log(profile)
          const coursesResponse = await get_user_courses(user.id);
          if (coursesResponse.status === 200) {
            setProfile(prev => ({ ...prev, courses: coursesResponse.body }));
          }
        }
      }
    }
    fetchData();
  }, [userId]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const updates = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      desc: profile.desc,
      img_url: profile.img_url
    };
  
    try {
      const response = await update_user(profile.id, updates);
      if (response.status === 200) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsEditing(false);
      } else {
        throw new Error(response.body);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.toString(),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, img_url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAwardLogsClick = () =>{
    setIsAwardLogsModalOpen(true)
  }

  return (
    <Box align="center" pt={5} minHeight="calc(100vh - 166px)" backgroundColor="white" width="90%" marginX="auto">
      <Text mb="2" className="page-title">User Profile</Text>
      {(userId === undefined || profile.id === userId) && (
        <><Flex p="5" borderRadius="lg" justifyContent="center">
        <Box p="5" borderRadius="lg"  width="40%">
          <Flex direction="column" align="center" mb="4" maxWidth="500px">
            <Flex>
              <Avatar name={`${profile.first_name} ${profile.last_name}`} src={profile.img_url} size="xl" mb="4" marginRight= "3"/>
            <Box align="left">
            <Heading as="h3" size="lg" mb="2">{profile.first_name} {profile.last_name} </Heading>
            {(profile.role === "student" || userType === "admin") && (<Text fontWeight="bold">{profile.id}</Text>)}
            <Text fontWeight="bold">{profile.email}</Text>
            </Box></Flex>
            {isEditing ? (
              <>
                <FormControl id="first_name" mb="4">
                  <FormLabel>First Name</FormLabel>
                  <Input value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} />
                </FormControl>
                <FormControl id="last_name" mb="4">
                  <FormLabel>Last Name</FormLabel>
                  <Input value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} />
                </FormControl>
                <FormControl id="desc" mb="4">
                  <FormLabel>Description</FormLabel>
                  <Input type="text" value={profile.desc} onChange={(e) => setProfile({ ...profile, desc: e.target.value })} />
                </FormControl>
                <FormControl id="img_url" mb="4">
                  <FormLabel>Profile Picture</FormLabel>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                </FormControl>
                <Flex direction="row" flexWrap="wrap"><Button colorScheme="teal" mr="4" onClick={handleSaveChanges} isLoading={isLoading}>Save Changes</Button>
                  <Button colorScheme="red" onClick={() => setIsEditing(false)}>Cancel</Button></Flex>
              </>
            ) : (
              <>
                <Text>{profile.desc}</Text>
                {userId === undefined ? (
                  <Button colorScheme="teal" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : null}
              </>
            )}
          </Flex>
        </Box>
        {(profile.role=== "student" || profile.role=== "staff") && (<>
        <Box shadow="md" borderWidth="1px" width="60%" justifyContent="center">
          { (profile && profile.role === "student") && (
            <Box shadow="md" borderWidth="1px" padding={2} marginBottom={2}> 
            <Text> Current Ranking: {profile.rank}</Text>
            <Text>Accumulated Points: {profile.accumulated_pts} </Text>

            <Button marginTop={5} colorScheme='teal' onClick={handleAwardLogsClick}>See Award Logs</Button>
            <AllPointLogsModal isOpen={isAwardLogsModalOpen} onClose={() => setIsAwardLogsModalOpen(false)}  studentID={profile.id}/>
            </Box>
          )}
          <Text fontWeight="bold">Courses</Text><Flex direction="row" flexWrap="wrap" padding="2">
              {profile && profile.courses && profile.courses.length > 0 ? (
                profile.courses.map(course => (
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
        </Box></>)}
        </Flex></>
      )}
    </Box>
  );
};

export default ProfilePage;
