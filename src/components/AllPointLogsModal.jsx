import React, {useState, useEffect} from 'react';
import { Box,  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Flex, Divider, Text} from '@chakra-ui/react';
import { get_staff_assign_points_logs } from '../controllers/Staff';
import { get_student_awarded_points_logs } from '../controllers/Student';
import { get_staff_by_id, is_staff } from '../controllers/Staff'; 
import { get_student_by_id, is_student } from '../controllers/Student';

const AllPointLogsModal = ({ isOpen, onClose, staffID, studentID }) => {
  const [logs, setLogs] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [studName, setStudName] = useState('');

  const fetchLogs = async () => {
    try {
      let logsWithNames;
      if(staffID){
      let response; 
      response = await get_staff_assign_points_logs(staffID)  
      const logs= response.body;
        if (logs && Array.isArray(logs)) { 
          if((logs.length) > 0){ 
            let filteredLogs;
            if (studentID) {
              // Filter logs by both staff_id and student_id
              filteredLogs = logs.filter(log => log.student_id === studentID);
            } else {
              // Filter logs only by staff_id
              filteredLogs = logs;
            }
            // Iterate through the logs array
            logsWithNames = await Promise.all(
                filteredLogs.map(async (log) => {
                // Fetch staff data
                const staffData = await get_staff_by_id(log.staff_id);
                // Fetch student data
                const studentData = await get_student_by_id(log.student_id);

                // Combine first name and last name for staff and student names
                const staffName = `${staffData.body.first_name} ${staffData.body.last_name}`;
                const studentName = `${studentData.first_name} ${studentData.last_name}`;

                // Add staff and student names to the log object
                return {
                  ...log,
                  staffName,
                  studentName,
                };
              })
            );
            // Sort logs by timestamp
            logsWithNames.sort((a, b) => b.timestamp - a.timestamp);

            // Update state with logs containing staff and student names
            setLogs(logsWithNames);}
        }
          else{
            setLogs([]);
          }
      } else {
        if(studentID && !staffID){
          
          const response= await get_student_awarded_points_logs(studentID);
          const logs= response.body;
        if (logs && Array.isArray(logs)) { 
          if((logs.length) > 0){ 
            
            // Iterate through the logs array
            logsWithNames = await Promise.all(
                logs.map(async (log) => {
                // Fetch staff data
                const staffData = await get_staff_by_id(log.staff_id);
                // Fetch student data
                const studentData = await get_student_by_id(log.student_id);

                // Combine first name and last name for staff and student names
                const staffName = `${staffData.body.first_name} ${staffData.body.last_name}`;
                const studentName = `${studentData.first_name} ${studentData.last_name}`;

                // Add staff and student names to the log object
                return {
                  ...log,
                  staffName,
                  studentName,
                };
              })
            );
            // Sort logs by timestamp
            logsWithNames.sort((a, b) => b.timestamp - a.timestamp);

            // Update state with logs containing staff and student names
            setLogs(logsWithNames);}
        }
          else{
            setLogs([]);
          }
        }
        else{
          console.log('No Logs found.', response );
        }
      }
    } catch (error) {
      // Handle error
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    if (isOpen && (staffID || studentID)) {
      fetchLogs();
    }
  }, [staffID, studentID, isOpen]);
 

  const groupLogsByDate = (logs) => {
    const groupedLogs = {};
    logs.forEach((log) => {
      const dateKey = new Date(log.timestamp.seconds * 1000).toLocaleDateString('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!groupedLogs[dateKey]) {
        groupedLogs[dateKey] = [];
      }
      groupedLogs[dateKey].push(log);
    });
    return groupedLogs;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" width="90%" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent minWidth="fit-content">
        <ModalHeader backgroundColor="#4FD1C5" color="white" borderRadius="md" textAlign="center">Point Award Logs</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowX="auto">
        {logs.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            No logs available.
          </Text>
        ) : (Object.entries(groupLogsByDate(logs)).map(([date, logsForDate]) => (
              <Box key={date} my={5}>
                <Text fontSize="lg" fontWeight="bold" mb={2} textAlign="center">
                  {date}
                </Text>
                {logsForDate.map((log, index) => (
                  <Flex key={index} mb={1} justify="start" width="100%" alignItems="center">
                    <Text flex="0 0 10%" mr={4} fontWeight="bold">
                      {new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                    <Box flex="1" py={1} px={4} border="1px solid gray" borderRadius="15px" >
                      <Text>
                        <strong>{log.points} points</strong> awarded to <strong>{log.studentName}</strong> (Student ID: {log.student_id}) for <strong>{log.reason}</strong>.
                      </Text>
                      <Text textAlign="right" >
                        <strong>Awarded By:</strong> {log.staffName}
                      </Text>
                    </Box>
                  </Flex>               
                ))}
              </Box>
          )))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AllPointLogsModal;
