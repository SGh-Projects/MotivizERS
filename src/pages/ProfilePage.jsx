import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Input, Avatar, Heading, useToast, Text
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { get_user_by_id, update_user, get_current_user } from '../controllers/Auth';
import { get_user_courses } from '../controllers/Course';

const ProfilePage = ({ userType }) => {
  const [profile, setProfile] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    desc: '',
    img_url: '',
    courses: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          setProfile({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            desc: user.desc,
            img_url: user.img_url,
            courses: []
          });

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

  return (
    <Box align="center" pt={5} minHeight="calc(100vh - 166px)" backgroundColor="white" width="90%" marginX="auto">
      <Text mb="2" className="page-title">User Profile</Text>
      {(userId === undefined || profile.id === userId) && (
        <Box p="5" shadow="md" borderWidth="1px" borderRadius="lg" maxWidth="500px">
          <Flex direction="column" align="center" mb="4">
            <Avatar name={`${profile.first_name} ${profile.last_name}`} src={profile.img_url} size="xl" mb="4" />
            <Heading as="h3" size="lg" mb="2">{profile.first_name} {profile.last_name} </Heading>
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
                <Text fontWeight="bold">Email: {profile.email}</Text>
                <Text>Description: {profile.desc}</Text>
                {userId === undefined ? (
                  <Button colorScheme="teal" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : null}
              </>
            )}
          </Flex>
        </Box>
      )}
    </Box>
  );
};

export default ProfilePage;
