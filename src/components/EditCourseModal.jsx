import { Box, Flex, Card, FormControl, FormLabel, Select, Input, Textarea, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useBreakpointValue, useToast } from "@chakra-ui/react";
import { useState, useEffect } from 'react';
import CourseSuccessModal from "./CourseSuccessModal"; // Ensure this is implemented correctly in your project
import { create_course, edit_course } from '../controllers/Course';

const EditCourseModal = ({ isOpen, onClose, courseData, onCourseUpdated }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const modalWidth = useBreakpointValue({ base: "95%", md: "75%", lg: "75%" });
  const toast = useToast();

  useEffect(() => {
    if (courseData) {
      setCode(courseData.code || '');
      setName(courseData.name || '');
      setDesc(courseData.desc || '');
      setYear(courseData.year || '')
      setSemester(courseData.semester || '')
      setImgUrl(courseData.img_url || '');
    } else {
      resetForm();
    }
  }, [courseData, isOpen]);

  const resetForm = () => {
    setCode(''); 
    setName('');
    setDesc('');
    setYear('');
    setSemester('');
    setImgUrl('');
  };

  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Months are zero-based
    const nextYear = currentYear + 1;
    
    // Check if it's the first or second half of the year
    if (currentMonth >= 1 && currentMonth <= 6) {
      return `${currentYear - 1}-${currentYear}`;
    } else {
      return `${currentYear}-${nextYear}`;
    }
  };
  
  const getNextAcademicYear = (currentAcademicYear) => {
    const [startYear, endYear] = currentAcademicYear.split('-').map(Number);
    return `${endYear}-${endYear + 1}`;
  };

  const academicYears = [getCurrentAcademicYear()];

    // Generate options for the next 2 academic years
    for (let i = 0; i < 2; i++) {
      academicYears.push(getNextAcademicYear(academicYears[i]));
    }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newCourseData = { code, name, desc, year, semester, img_url: imgUrl };
      if (courseData && courseData.id) {
        console.log(courseData)
        await edit_course(courseData.id, newCourseData);
      } else {
        await create_course(newCourseData);
      }

      toast({
        title: 'Success',
        description: `Course ${courseData ? 'updated' : 'created'} successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      resetForm();
      onClose(); // Close the modal
      onCourseUpdated(); // Trigger refresh
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${courseData ? 'update' : 'create'} course: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent width={modalWidth}>
        <ModalHeader backgroundColor="#4FD1C5" color="white">{courseData ? 'Edit Course' : 'Add New Course'}</ModalHeader>
        <ModalCloseButton color="white" />
        <form onSubmit={handleSubmit}>
          <ModalBody pb={6}>
            {/* Form Fields */}
            <Flex direction="column" gap={4}>
              <FormControl isRequired>
                <FormLabel>Course Code</FormLabel>
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Course Code" />
              </FormControl>
              <Flex w="100%">
                <FormControl w="50%" mx={1} isRequired>
                  <FormLabel>Academic Year</FormLabel>
                  <Select value={year} onChange={(e) => setYear(e.target.value)} placeholder="Select Academic Year">
                    {academicYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mx={1} w="50%" isRequired>
                  <FormLabel>Semester</FormLabel>
                  <Select value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Select Semester">
                    <option value="S1">Semester 1</option>
                    <option value="S2">Semester 2</option>
                    <option value="S3">Semester 3</option>
                  </Select>
                </FormControl>
              </Flex>
              <FormControl isRequired>
                <FormLabel>Course Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Course Name" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" />
              </FormControl>
              <FormControl>
                <FormLabel>Image URL (optional)</FormLabel>
                <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Image URL" />
                <input type="file" accept="image/*" onChange={handleFileInputChange} style={{ marginTop: '10px' }} />
              </FormControl>
            </Flex>
          </ModalBody>
          <ModalFooter backgroundColor="#4FD1C5">
            <Button type="submit" colorScheme="teal" mr={3}>Save</Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditCourseModal;


  