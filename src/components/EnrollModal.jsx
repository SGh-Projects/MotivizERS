import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  Button, useToast, Select, VStack
} from "@chakra-ui/react";
import { enroll, get_course_lecturer, get_course_students} from '../controllers/Course';
import { get_students } from '../controllers/Student';
import { get_all_staff } from '../controllers/Staff';
import SearchBar from './../components/SearchBar';

const EnrollModal = ({ isOpen, onClose, selectedCourse }) => {
    const toast = useToast();
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);

    // Define fetchStudents and fetchStaff here so they are accessible to handleEnroll
    const fetchStudents = async () => {
        const result = await get_students();
        setStudents(result.body || []);
    };

    const fetchStaff = async () => {
        const result = await get_all_staff();
        setStaff(result.body || []);
    };

    useEffect(() => {
        fetchStudents();
        fetchStaff();
    }, []);

    const handleEnroll = async () => {
        const selectedId = selectedStudentId || selectedStaffId;
        const personType = selectedStudentId ? 'student' : 'staff';

        if (!selectedId) {
            toast({
                title: "Selection required",
                description: `Please select a ${personType} to enroll.`,
                status: "warning",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        try {
            const response = await enroll(selectedId, selectedCourse?.id);
            if(response){
                toast({
                    title: 'Enrollment Successful',
                    description: `${personType.charAt(0).toUpperCase() + personType.slice(1)} has been enrolled in ${selectedCourse?.name}.`,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                onClose();  // This closes the modal
                await fetchStudents();  // Update the list of students
                await fetchStaff();     // Update the list of staff
                await get_course_lecturer(selectedCourse.id)
                let r = await get_course_students(selectedCourse.id) 
            }
        } catch (error) {
            toast({
                title: 'Enrollment Failed',
                description: error.message || "An error occurred during enrollment.",
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent maxW={{ base: "90%", md: "500px" }}>
                <ModalHeader bg="teal.300" color="white" roundedTop="md">Enroll Person to {selectedCourse?.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <SearchBar searchType="student" onSelectItem={(item) => setSelectedStudentId(item.id)} />
                        <Select placeholder="Select student to enroll" onChange={(e) => setSelectedStudentId(e.target.value)}>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>{student.name}</option>
                            ))}
                        </Select>
                        <SearchBar searchType="staff" onSelectItem={(item) => setSelectedStaffId(item.id)} />
                        <Select placeholder="Select staff to enroll" onChange={(e) => setSelectedStaffId(e.target.value)}>
                            {staff.map((staffMember) => (
                                <option key={staffMember.id} value={staffMember.id}>{staffMember.name}</option>
                            ))}
                        </Select>
                    </VStack>
                </ModalBody>
                <ModalFooter bg="teal.300" roundedBottom="md">
                    <Button colorScheme="teal" mr={3} onClick={handleEnroll}>Enroll Selected Person</Button>
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EnrollModal;

