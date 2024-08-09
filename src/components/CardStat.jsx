import { useState, useEffect } from 'react';
import * as preset from './preset';
import { Box, Text, Flex, Divider, Tooltip } from '@chakra-ui/react';
import { get_staff_points_breakdown } from '../controllers/Staff';
import { get_current_user } from '../controllers/Auth';
import { get_student_points_breakdown } from '../controllers/Student';
import PointTypeLogsModal from '../components/PointTypeLogsModal';

const CardStat = ({userType}) => {
  const [pointsBreakdown, setPointsBreakdown] = useState({
    goodConduct: 0,
    courseParticipation: 0,
    volunteering: 0,
    extracurricular: 0
  });
      const [user, setUser] = useState([]);
      const [selectedType, setSelectedType] = useState(null);
     const [isModalOpen, setIsModalOpen] = useState(false);

      useEffect(() => {
        const fetchCurrentUser = async () => {
          try {
            const userResult = await get_current_user();
            if (userResult && userType === "staff") {
                setUser(userResult)
                const fetchPointsBreakdown = async () => {
                    try {
                      const breakdown = await get_staff_points_breakdown(userResult.id);
                      setPointsBreakdown(breakdown);
                    } catch (error) {
                      console.error('Error fetching points breakdown:', error);
                    }
                  };
              
                  fetchPointsBreakdown();
            }
            else if (userResult && userType === "student") { 
                setUser(userResult)
                const fetchPointsBreakdown = async () => {
                    try {
                      const breakdown = await get_student_points_breakdown(userResult.id)
                      setPointsBreakdown(breakdown);
                    } catch (error) {
                      console.error('Error fetchin1g points breakdown:', error);
                    }
                  };
              
                  fetchPointsBreakdown();
            }
          } catch (error) {
            console.error('Error fetching current user:', error);
          }
        };
        fetchCurrentUser();
      }, []);

      const handlePointTypeClick = (type) => {
        setSelectedType(type);
        setIsModalOpen(true);
      };
    
      const handleCloseModal = () => {
        setSelectedType(null);
        setIsModalOpen(false);
      };

      const renderTooltipContent = (pointType) => {
        switch (pointType) {
          case 'goodConduct':
            return 'See award logs for good conduct';
          case 'courseParticipation':
            return 'See award logs for participation in the course';
          case 'volunteering':
            return 'See award logs for volunteering activities';
          case 'extracurricular':
            return 'See award logs for extracurricular activities';
          default:
            return '';
        }
      };
 

    const styleInfoRow = {
      w: "80%",
      transition: 'transform 0.3s',
      color: 'teal',
      display: 'flex',  
      paddingX: '70px',
      borderRadius: '5px', 
      cursor: 'pointer',  
      _hover: {
        transform: 'scale(1.03)', 
        backgroundColor: '#38B2AC',
        color: 'white',
        textDecoration: 'underline',  
      },
    };
     
    const styleCard = {
      boxRadius: preset.lengthM3,
      backgroundColor:  '#FFF', // White background
      padding: '0',
      transition: 'transform 0.3s',
      flexDirection: 'column',
      borderRadius: preset.lengthM3, 
      boxShadow: "0px 2px 4px 1px rgba(0, 0, 0, 0.3)",
    
  };
  
  

    const styleTitle = {
        color: 'white',
        backgroundColor: 'teal',
        padding: '10px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        borderTopLeftRadius: '20px', // Top left border radius
        borderTopRightRadius: '20px', // Top right border radius
        width: '100%',
        justifyContent: 'center',
    };

    const styleQuota = {
        fontSize: preset.lengthL1,
        display: 'flex',
        flexDirection: 'row',
    };

    const styleBalance = {
        color: preset.colorFontMain,
        fontWeight: 'bold',
        paddingRight: preset.lengthS2
    };

    const styleAlotted = {
        color: preset.colorFontLabel,
    };

    const styleLabel = {
        color: preset.colorFontLabel,
        fontSize: '0.9rem',
        fontWeight: 'bold',
    };

    return (
      <>
      <Box w="fit-content">
        <Flex sx={styleCard} align="center" w="fit-content">
            <Box sx={styleTitle}>
                <Text>Points Balance</Text>
            </Box>
            
            <Box sx={styleQuota}>
                <Text sx={styleBalance}>{user.current_pts}</Text>
                <Text sx={styleAlotted}>{userType === 'staff' ? '/300' : `/ ${user.accumulated_pts}`}</Text>
            </Box>

            <Divider my={1} w="80%" borderColor="teal.500" />

            <Box>
              <Text sx={styleLabel} my="2">Points Awarded <Text as="span" fontSize="xs">(Select for Details)</Text></Text>
            </Box>

            <Box  pb={5} align="center"> 
                <Tooltip label={renderTooltipContent('goodConduct')}  placement="top">
                    <Text minWidth="fit-content" justifyContent="center" sx={styleInfoRow} onClick={() => handlePointTypeClick('goodConduct')}>
                        <Text fontWeight="bold" display="inline">{"Good Conduct:\t"}</Text> 
                        <Text fontWeight="bold" display="inline" pl={5}>{pointsBreakdown?.goodConduct || 0}</Text>
                    </Text>
                </Tooltip>
                <Tooltip label={renderTooltipContent('volunteering')}  placement="top">
                    <Text minWidth="fit-content" justifyContent="center" sx={styleInfoRow} onClick={() => handlePointTypeClick('volunteering')}>
                        <Text fontWeight="bold" display="inline">{"Volunteer:\t"}</Text> 
                        <Text fontWeight="bold" display="inline" pl={5}>{pointsBreakdown?.volunteering || 0}</Text>
                    </Text>
                </Tooltip> 
                <Tooltip label={renderTooltipContent('extracurricular')}  placement="top">
                    <Text minWidth="fit-content" justifyContent="center" sx={styleInfoRow} onClick={() => handlePointTypeClick('extracurricular')}>
                        <Text fontWeight="bold" display="inline">{"Extracurricular:\t"}</Text> 
                        <Text fontWeight="bold" display="inline" pl={5}>{pointsBreakdown?.extracurricular || 0}</Text>
                    </Text>
                </Tooltip> 
                <Tooltip label={renderTooltipContent('courseParticipation')}  placement="top">
                    <Text minWidth="fit-content" justifyContent="center" sx={styleInfoRow} onClick={() => handlePointTypeClick('courseParticipation')}>
                        <Text fontWeight="bold" display="inline">{"Course Participation:\t"}</Text> 
                        <Text fontWeight="bold" display="inline" pl={5}>{pointsBreakdown?.courseParticipation || 0}</Text>
                    </Text>
                </Tooltip>  
            </Box>
        </Flex>
        </Box>
        {selectedType && pointsBreakdown[selectedType] !== undefined && (
  <PointTypeLogsModal
    isOpen={isModalOpen}
    onClose={handleCloseModal}
    type={selectedType}
    userID={user ? user.id : null} 
    points={pointsBreakdown[selectedType] || 0}
  />
)}
        </>
    );
}
 
export default CardStat;