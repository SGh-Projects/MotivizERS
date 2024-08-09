import * as preset from './preset';
import { Box, Text, Image, Flex, Button, Avatar,useBreakpointValue, Divider } from '@chakra-ui/react';
import { IoIosArrowForward } from 'react-icons/io';
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';

const CardStudentSnip = (props) => {
    const { rank, img_url, first_name, last_name, id, current_pts, accumulated_pts,i } = props.data; 
    const [index, setIndex] = useState(0);
    
    //alternating bg colors
    const bgColor = i % 2 === 0 ? 'teal.100' : 'teal.50';

    //if the buttons should be inline based on viewport width
    const buttonsInline = useBreakpointValue({ base: false, md: true, lg: true });

    const navigate = useNavigate();
    const handleAssignPointsClick = (id, event) => {
        event.stopPropagation();
        navigate(`/assign-points/${id}`, { state: { data: props.data } });
    };

    const handleCardClick = () => {
        props.handleOpenStudentModal(index);
    };

    //style for card
    const styleCard = {
        boxRadius: preset.lengthM3,
        backgroundColor: bgColor,
        padding: preset.lengthS3,
        borderRadius: preset.lengthM1,
        border: "1px solid #d3d3d3",
        w: "100%",
        transition: 'transform 0.3s',
        _hover: {
            transform: 'scale(1.05)',
            backgroundColor: "teal.200",
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
        color: preset.colorFontLabel,
        fontWeight: 'bold'
    }

    const styleImage = {
        width: preset.lengthL2,
        borderRadius: preset.lengthS3,
        marginRight: preset.lengthS3
    };

    const styleContent = {
        flex: 1,
        textAlign: 'left'
    };

    const styleTitle = {
        color: preset.colorFontLabel,
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
        color: preset.colorFontDisabled,
        paddingLeft: preset.lengthS3
    };

    // action buttons
    const actionButtons = () => { 
        if (props.userType === 'staff' || props.userType === "admin"){ 
            return(
                <>
                <Box className="actionicon" textAlign="right">
                    <Button colorScheme="teal" marginRight="5px" onClick={(event) => handleAssignPointsClick(id, event)}>
                        Assign Points
                        <IoIosArrowForward sx={styleArrow}/>
                    </Button>
                </Box>
                </>   
            );
        }
        else{ 
            <></>
        }
    };

    return (
        <Box sx={styleCard} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
        <Flex align="center">
            <Text className="rank" sx={styleRank}>{rank}</Text>
            <Box>
                <Avatar src={img_url} name={first_name + " " + last_name} size="sm" mr="10px"/>
            </Box>

            <Box sx={styleContent}>
                <Text className="title" sx={styleTitle}>{first_name + " " + last_name}</Text>
                <Text sx={styleText}>{id}</Text>
            </Box>

            <Box sx={stylePoints}>
                <Text className="count" sx={stylePtCount}>{accumulated_pts}</Text>
                <Text className="type" sx={stylePtType}>MP</Text>
            </Box>

            {buttonsInline && (
                <>{actionButtons()}</>
            )}
        </Flex>
        {!buttonsInline && (
            (props.userType !== 'student' && (
                <>
                    <Divider borderColor="teal.500" marginTop="10px"/> 
                    {actionButtons()}
                </>
            )) || (props.userType === 'student' && (<>{actionButtons()}</>))
        )}
        </Box>
    );
}
 
export default CardStudentSnip;