import { Box } from "@chakra-ui/react";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabList, TabPanels, Tab, TabPanel, Spacer, Flex } from '@chakra-ui/react'
import CardRank from '../components/CardRank'
import { get_ranked_students, get_ranked_students_rt } from "../controllers/Leaderboard";


export default function LeaderBoard( {userType} ) {
  const [rankedStudents, setRankedStudents] = useState([]);

  useEffect(() => {
    const fetchDataAndSubscribe = async () => {
      try {
        // Subscribe to real-time updates
        const unsubscribe = get_ranked_students_rt((updatedStudents) => {
          // Filter out students with null rank, then sort and set the state
          const filteredUpdatedStudents = updatedStudents.filter(student => student.rank !== null);
          const sortedUpdatedStudents = [...filteredUpdatedStudents].sort((a, b) => a.rank - b.rank);
          setRankedStudents(sortedUpdatedStudents);
      });

      // Fetch initial data, filter out students with null rank, then sort and set the state
      get_ranked_students_rt((initialStudents) => {
          const filteredInitialStudents = initialStudents.filter(student => student.rank !== null);
          const sortedInitialStudents = [...filteredInitialStudents].sort((a, b) => a.rank - b.rank);
          setRankedStudents(sortedInitialStudents);
      });
  
        
      } catch (error) {
        console.error('Error fetching initial students:', error);
      }
    };
  
    fetchDataAndSubscribe();
  }, []);
  
  

  const styCont = { 
    height: 'fit-content',  
  };

  const tabsContainerStyle = {
    flex: 1,
  };

  const handleTabClick = (event) => {
    // Prevent the default tab switching behavior
    event.preventDefault();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderPage =(
    <>
            <Box width={{base: "98%", md:"90%"}} align="center" backgroundColor="white" pb="3" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
              <div className="page-title">LeaderBoard</div>
              <Box backgroundColor="orange.100" width="95%" p="1" borderRadius="lg">
                <Box backgroundColor="teal.500" borderRadius="lg">
                  <Flex justify="space-between" className="labels" width={{base: "98%", md: "98%"}} backgroundColor="teal.500" borderRadius="lg" textColor= 'white' mb={2} py={2}>
                    <Box flex="1" ml={4} textAlign="left" fontWeight="bold" fontSize="lg" >Rank</Box>
                    <Box flex="2" textAlign="center" fontWeight="bold" fontSize="lg">Student</Box>
                    <Box flex="1" mr={12} textAlign="right" fontWeight="bold" fontSize="lg">Points</Box>
                  </Flex>
                </Box>
                <Box className="student-list" width="98%">
                  {rankedStudents.map((data, index) => (
                    <React.Fragment key={index}>
                      <CardRank data={data}></CardRank>
                      <Spacer height={2} />
                    </React.Fragment>
                  ))}
                </Box>
            </Box>
          </Box>
        </>
  );

  return (
      <Box sx={styCont} className="merit-container" backgroundImage="linear-gradient(to bottom, #ffc561, #2fccbc)" width="100%"  align="center">
        {userType === "staff" && (
        <Tabs isFitted style={tabsContainerStyle} defaultIndex={0} backgroundColor="white" width={{base: "95%", md: "90%"}}>
          <TabList>
              <Link to="/leaderboard" style={{width: '50%', margin: 'auto'}}><Tab>Leaderboard</Tab></Link>
              <Link to="/merit-shop" style={{width: '50%'}}><Tab onclick={handleTabClick}>Merit Shop</Tab></Link>
          </TabList>

          <TabPanels>
            <TabPanel width="100%">
            <>
              {console.log("Component rerendered with updated data")}
              {renderPage}
            </>
            </TabPanel>
            <TabPanel></TabPanel>

          </TabPanels>
        </Tabs> 
        )}

        {userType !== "staff" && (
          <>
          {renderPage}
          </>
        )}  
      </Box>         
  );
}