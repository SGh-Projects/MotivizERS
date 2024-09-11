import React, { useState, useEffect, useRef } from 'react';
import { Box, InputGroup, InputLeftElement, Input, List, ListItem, Icon, Avatar, Text } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import CardAutofill from './CardAutofill';
import { Navigate, useNavigate } from 'react-router-dom';
import { get_students } from '../controllers/Student';
import { get_all_staff } from '../controllers/Staff';
import { search_courses, get_course_students, get_user_courses } from '../controllers/Course';
import { get_all_available_prizes } from '../controllers/Prize';

const AutocompleteSearchBar = ({ searchType, onSelectItem, onSearch, courseID, userID, userType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const navigate= useNavigate();
  const [allStudents, setAllStudents] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allPrizes, setAllPrizes] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setShowResults(false); // Clicked outside the search container, so hide the search results
    }
  };

  const fetchStudents = async () => { 
    try { 
        let result;
        if (courseID) {
          // Fetch students for the specific course
          result = await get_course_students(courseID);
        } else {
          // Fetch all students
          result = await get_students();
        } 
        if (result) { 
            setAllStudents(result.body);
        } else {
            console.error('Error:', result.body);
        }
    } catch (error) {
        console.error('Error fetching students:', error);
    }
  };

    const fetchStaff = async () => {
      try {
        const result = await get_all_staff(); 
        if (result) {
          setAllStaff(result.body);
        } else {
          console.error('Error:', result.body);
          return [];
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        return [];
      }
    };

    const fetchCourses = async (searchTerm) => {
      try{
        let result;
        if (userID && userType !== "admin" && userType !== "adminDemo") {
          // Fetch courses for the specific user
          result = await get_user_courses(userID)
          if(result.status === 200) {
            setAllCourses(result.body);  
          }
          else{
              console.error('Error:', result);
              return [];
          }
        } else {
          // Fetch all courses
          result = await search_courses(searchTerm);
          if(result) {
            setAllCourses(result);  
          }else {
            console.error('Error:', result);
            return [];
          }
        } 
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    };

    const fetchPrizes = async () => {
      try{
        const result= await get_all_available_prizes();
        if(result) { 
          setAllPrizes(result); 
        }else {
          console.error('Error:', result.body);
          return [];
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    };


  // Handle changes in the search input
  const handleInputChange = async (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); 
    setShowResults(newSearchTerm.trim() !== '');
      
    let filteredResults = [];
    if (searchType === 'student') {
      try{
        await fetchStudents(); // Wait for students data to be fetched
        filteredResults = allStudents.filter(result => {
          const fullName = `${result.first_name} ${result.last_name}`; 
          return ( 
            fullName.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            result.id.toLowerCase().startsWith(newSearchTerm.toLowerCase())
          );
      });
        setResults(filteredResults); 
      }catch (error){
        console.log(error)
      }
      
    } else if (searchType === 'course') {
      if (userID && userType !== "admin" && userType !== "adminDemo") {
        await fetchCourses(newSearchTerm); 
        filteredResults = allCourses.filter(result => { 
          return ( 
            result.name.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            result.code.toLowerCase().startsWith(newSearchTerm.toLowerCase())
          );
      });
        setResults(filteredResults); 
      } else{
        await fetchCourses(newSearchTerm);
        filteredResults= allCourses;
        setResults(filteredResults);
      }
      
      
    }else if (searchType === 'staff') {
      try{
        await fetchStaff(); // Wait for students data to be fetched
        filteredResults = allStaff.filter(result => {
          const fullName = `${result.first_name} ${result.last_name}`; 
          return ( 
            fullName.toLowerCase().includes(newSearchTerm.toLowerCase()) ||
            result.id.toLowerCase().startsWith(newSearchTerm.toLowerCase())
          );
      });
        setResults(filteredResults); 
      }catch (error){
        console.log(error)
      }
  }else if (searchType === 'prize'){
    try{
      await fetchPrizes();  
      const filtered = allPrizes.filter(result => {
        return(
        result.name.toLowerCase().includes(newSearchTerm.toLowerCase()));
      })  
      setResults(filtered); 
    }catch (error){
      console.log(error);
    }
  };
};

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch(searchTerm);
      setResults([]);
    }
  };

  const handleSearch = (item) => {
    setShowResults(false);
    if (searchType === 'student' && location.pathname === "/assign-points") { 
      onSelectItem(item); // Call onSelectItem only for assign points
    } else if (searchType === 'course' && item){
      navigate(`/course-students/${item.id}`, { state: { data: item } }) //update
    } else if (searchType === 'student' && location.pathname.startsWith("/course-students")){
      onSelectItem(item);
    }
    else{
      if (item) {
        onSelectItem(item); // Call onSelectItem if an item is selected
      } else {
        onSearch(); // Call onSearch if no item is selected
      }
    }
    setResults([]); // Clear search results after selection
  };

  return (
    <Box style={{ margin: 'auto', marginTop: '10px' }} position="relative" ref={searchContainerRef}>
      <InputGroup>
        <InputLeftElement pointerEvents="none" children={<SearchIcon color="teal.200" />} />
        <Input backgroundColor="white" type="text" placeholder="Search..." value={searchTerm} onChange={handleInputChange} onKeyDown={handleKeyDown} onClick={() => setShowResults(searchTerm.trim() !== '')}/>
      </InputGroup>
      {showResults && results.length > 0 && (
        <Box position="absolute" width="calc(100% - 2px)" bg="white" borderRadius="md" boxShadow="md" mt="0" left="0" zIndex="2">
          <List border="1px solid #A0AEC0">
            {results.map((result, index) => (
              <ListItem key={index} bg="white" border="1px solid #A0AEC0"  cursor="pointer" _hover={{ bg: 'teal.50' }} onClick={() => handleSearch(result)} textAlign="left" display="flex">
                <CardAutofill url={result.img_url} 
                  title={
                    searchType === 'student' || searchType === 'staff'
                      ? `${result.first_name} ${result.last_name}`
                      : result.name // Use result.name for course/prize search type
                  }
                  text={`${searchType === 'student'
                            ? `Student ID: ${result.id}`
                            : searchType === 'course'
                            ? `Course Code: ${result.code}`
                            :searchType === 'staff'
                            ? `Staff ID: ${result.id}`

                            :`Prize Cost: ${result.cost} MP`
                            
                    }`}
                  avatar={<Avatar src={result.img_url} 
                  name={searchType === 'student' || searchType === 'staff'
                        ? `${result.first_name} ${result.last_name}`
                        : result.name} 
                  size="sm" mr="10px"/>}/>
                
                
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default AutocompleteSearchBar;
