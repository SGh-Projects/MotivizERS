import * as preset from './preset';
import { Box, Text, Image, Avatar, Flex, Button, useBreakpointValue, Divider, Tooltip } from '@chakra-ui/react';
import { IoIosArrowForward } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { get_student_by_id } from '../controllers/Student';
import { useEffect, useState } from 'react';

const CardRank = (props) => {
    const { rank, img_url, first_name, last_name, id, accumulated_pts } = props.data;
    const [student, setStudent]= useState(null)
    const navigate= useNavigate();

    //alternating bg colors
    const bgColor = rank % 2 === 0 ? '#FFF7E9' : 'white';

    //style for card
    const styleCard = {
        boxRadius: preset.lengthM3,
        backgroundColor: `${bgColor}`,
        padding: preset.lengthS3,
        borderRadius: '50px',
        boxShadow: '0 1px 2px 3px #f7d086',
        w: "100%",
        cursor: "pointer",
        transition: 'transform 0.3s',
        _hover: {
            transform: 'scale(1.03)',
            boxShadow: '0 0 4px 2px #f7d086',
            
            '& .rank':{
                color: preset.colorFontMain
            },

            '& .title': {
                color: preset.colorFontMain
            },

            '& .count':{
                color: preset.colorFontMain
            },

            '& .actionicon': {
                color: preset.colorFontMain,
            },

        },
    };

    const styleRank = {
        fontSize: preset.lengthL1,
        marginRight: preset.lengthS3,
        marginLeft: preset.lengthS3,
        color: preset.colorFontMain,
        fontWeight: 'bold'
    }

    const styleImage = {
        width: preset.lengthL2,
        borderRadius: preset.lengthS3,
        marginRight: preset.lengthS3
    };

    const styleContent = {
        flex: 1,
        textAlign: 'left',
    };

    const styleTitle = {
        color: preset.colorFontMain,
        fontWeight: 'bold',
    };

    const styleText = {
        color: preset.colorFontMain
    };

    const stylePoints = {

    };

    const stylePtCount = {
        fontWeight: 'bold',
        color: preset.colorFontLabel,
        fontSize: preset.lengthM2,
        pading: 0
    };
    
    const stylePtType = {
        fontSize: preset.lengthS3
    };

    const styleArrow = {
        fontSize: preset.lengthL2,
        color: preset.colorFontMain
    };

    const getRankIconColor = (rank) => {
        switch (rank) {
            case 1:
                return "gold"; // Gold color for rank 1
            case 2:
                return "silver"; // Silver color for rank 2
            case 3:
                return "brown"; // Bronze color for rank 3
        }
    };

    const handleRankClick = async (studentid) => { 
        const studentData= await get_student_by_id(studentid);
        navigate(`/profile-page/${studentid}`, { state: { data: studentData.body } });
      };

    return (
        <Flex sx={styleCard} align="center" onClick={() => handleRankClick(id)}>
            {
                (rank === 1 || rank===2 || rank===3) && (
                    <Box ml={3}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill={getRankIconColor(rank)} className="bi bi-award-fill" viewBox="0 0 16 16">
                        <path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/>
                        <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
                    </svg></Box>
                )
            }

            <Text className="rank" sx={styleRank}>{rank}</Text>
            <Box>
                <Avatar sx={styleImage} name={first_name + " " + last_name} src={img_url} alt="placeholder" />
            </Box>

            <Box sx={styleContent}>
                <Text className="title" sx={styleTitle}>{first_name + " " + last_name}</Text>
                <Text sx={styleText}>{id}</Text>
            </Box>

            <Box sx={stylePoints}>
                <Text className="count" sx={stylePtCount}>{accumulated_pts}</Text>
                <Text className="type" sx={stylePtType}>MP</Text>
            </Box>

            <Box className="actionicon" sx={styleArrow}>
                <IoIosArrowForward />
            </Box>
        </Flex>
    );
}
 
export default CardRank;

const TopEarnerCard = (props) =>{
    const { rank, img_url, first_name, last_name, id, accumulated_pts, course_code } = props.data;

    const buttonsInline = useBreakpointValue({ base: false, md: true, lg: true });

    const navigate = useNavigate();
    const handleAssignPointsClick = (studentid, event) => {
        event.stopPropagation();
        navigate(`/assign-points/${studentid}`, { state: { data: props.data } });
    };

    //style for card
    const styleCard = {
        boxRadius: preset.lengthM3, 
        backgroundColor: "#FFF7E9",
        paddingX: '10px',
        borderRadius: '30px',
        boxShadow: '0 1px 2px 3px #f7d086',
        w: "100%",
        transition: 'transform 0.3s',
        _hover: {
            transform: 'scale(1.03)',
            boxShadow: '0 0 4px 2px #f7d086',
            
            '& .rank':{
                color: preset.colorFontMain
            },

            '& .title': {
                color: preset.colorFontMain
            },

            '& .count':{
                color: preset.colorFontMain
            },

            '& .actionicon': {
                color: preset.colorFontMain,
            },

        },
    };

    const styleRank = {
        fontSize: preset.lengthL1,
        marginRight: preset.lengthS3,
        marginLeft: preset.lengthS3,
        color: preset.colorFontMain,
        fontWeight: 'bold'
    }

    const styleImage = {
        width: preset.lengthL2,
        borderRadius: preset.lengthS3,
        marginRight: preset.lengthS3
    };

    const styleContent = {
        flex: 1,
        textAlign: 'left',
    };

    const styleTitle = {
        color: preset.colorFontMain,
        fontWeight: 'bold',
    };

    const styleText = {
        color: preset.colorFontMain
    };

    const stylePtCount = {
        fontWeight: 'bold',
        color: preset.colorFontMain,
        fontSize: preset.lengthM1,
        pading: 0
    };
    
    const stylePtCourse = {
        color: 'black',
        fontSize: '1rem',
        fontWeight: 'bold', 
        fontStyle: 'italic',
    };

    // action buttons
    const actionButtons = () => {  
        return(
            <Box className="actionicon" textAlign="right">
                <Tooltip label="Assign points"  placement="right">
                    <Button paddingX="1" colorScheme="teal" onClick={(event) => handleAssignPointsClick(id, event)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-patch-plus-fill" viewBox="0 0 16 16">
                        <path d="M10.067,.87a2.89,2.89,0,0,0-4.134,0l-.622.638-.89-.011a2.89,2.89,0,0,0-2.924,2.924l.01.89-.636.622a2.89,2.89,0,0,0,0,4.134l.637.622-.011.89a2.89,2.89,0,0,0,2.924,2.924l.89-.01.622.636a2.89,2.89,0,0,0,4.134,0l.622-.637.89.011a2.89,2.89,0,0,0,2.924-2.924l-.01-.89.636-.622a2.89,2.89,0,0,0,0-4.134l-.637-.622.011-.89a2.89,2.89,0,0,0-2.924-2.924l-.89.01ZM8.5,6v1.5H10a.5.5,0,0,1,0,1H8.5V10a.5.5,0,0,1-1,0V8.5H6a.5.5,0,0,1,0-1h1.5V6a.5.5,0,0,1,1,0"/>
                        </svg> 
                    </Button>
                </Tooltip>
            </Box>   
        );
        
    };

    return (
        <Box sx={styleCard}>
        <Flex align="center">
        
            <Text className="rank" sx={styleRank}>{rank}</Text>
            <Box>
                <Avatar sx={styleImage} src={img_url} name={first_name + " " + last_name} alt="placeholder" />
            </Box>

            <Box sx={styleContent}>
                <Text className="title" sx={styleTitle}>{first_name + " " + last_name}</Text>
                <Text sx={styleText}>{id}</Text>
            </Box>

            <Box my="1" mr="5" textAlign="right">
                <Text className="count" sx={stylePtCount} mb="3">{accumulated_pts} MP</Text>
                <Text className="type" sx={stylePtCourse}>{course_code}</Text>
            </Box>

            <Box>
                {buttonsInline && (
                    <>{actionButtons()}</>
                )}
            </Box>

        </Flex>
        {!buttonsInline && (
            <>
            <Divider borderColor="teal.500" marginY="3px"/>
            <Box marginLeft="14">{actionButtons()}</Box></>
        )}</Box>
    );
};
export { TopEarnerCard };