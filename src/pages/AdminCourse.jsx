import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, Button, Avatar, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogContent, useDisclosure } from "@chakra-ui/react";
import SearchBar from './../components/SearchBar'; 
import { useNavigate } from 'react-router-dom';

const AdminCourse = ({ userType }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState("My Courses");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const courses = [ // data
    { name: 'Comp 1600', id: 'co222', description: 'Introduction to Computing', image: 'course1.jpg' },
    { name: 'Comp 2600', id: 'co435', description: 'Data Structures', image: 'course2.jpg' },
    { name: 'Info 101', id: 'co324', description: 'Information Systems', image: 'course3.jpg' },
  ];

  const navigate = useNavigate();
  const handleCourseClick = (course) => {
    navigate(`/admin-details/${course.id}`, { state: { data: course } });
  };

  useEffect(() => {
    if (userType === "admin") {
      setTitle("All Courses");
    } else {
      setTitle("My Courses");
    }
  }, [userType]);

  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm.toLowerCase());
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().startsWith(searchTerm)
  );

  const handleEditCourse = (courseId, event) => {
    event.stopPropagation();
    console.log("Edit Course:", courseId);
    // Implement course edit functionality here
  };

  const handleDeleteConfirmation = (course, event) => {
    event.stopPropagation();
    setSelectedCourse(course);
    onOpen();
  };

  const handleDeleteCourse = () => {
    console.log("Delete Course:", selectedCourse.id);
    // Implement course delete functionality here
    onClose();
  };

  return (
    <Box mt={3} margin="auto" maxWidth="1000px" width="80%">
      <Text mb={4} className='page-title'>{title}</Text>
      <SearchBar searchType="course" onSearch={handleSearch} />

      <Flex direction="column" gap={4} mt={4}>
        {filteredCourses.map(course => (
          <Box key={course.id} p={3} shadow="md" borderWidth="1px" borderRadius="lg" _hover={{ boxShadow: "xl", cursor: "pointer" }}>
            <Flex alignItems="center" gap={4}>
              <Box flexShrink={0} ml="5">
                <Avatar name={course.description} borderRadius="full" boxSize="75px" src={course.image} alt={course.name} />
              </Box>
              <Box flex="1" textAlign="center">
                <Text fontSize="xl" fontWeight="bold">{course.name}</Text>
                <Text mt={1}>{course.description}</Text>
              </Box>
              {userType === "admin" && (
                <>
                  <Button colorScheme="blue" onClick={(e) => handleEditCourse(course.id, e)}>Edit</Button>
                  <Button colorScheme="red" onClick={(e) => handleDeleteConfirmation(course, e)}>Delete</Button>
                </>
              )}
            </Flex>
          </Box>
        ))}
      </Flex>

      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Course</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {selectedCourse?.name}? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" onClick={handleDeleteCourse} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminCourse;
