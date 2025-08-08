import * as preset from './preset';
import { Box, Text, Image, Flex, Button, useBreakpointValue, Divider } from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { IoIosArrowForward } from 'react-icons/io';
import { useState } from 'react';
import { BsBorderWidth } from 'react-icons/bs';

const CardItem = (props) => {

    const { img_url, name, desc, cost, type, demo, userType} = props.data;
    const [index, setIndex] = useState(0);
    const [isSelected, setIsSelected] = useState(false);
     //if the buttons should be inline based on viewport width
     const buttonsInline = useBreakpointValue({ base: false, md: true, lg: true });

     const styleCard = {
        boxRadius: preset.lengthM3,
        boxShadow: '0 2px 8px 2px #cfcfcf',
        padding: preset.lengthS3,
        backgroundColor: 'white',
        borderRadius: preset.lengthM1,
        cursor: 'pointer',
        width: {base:"260px", md: "280px"},
        height: "fit-content",
        transition: 'transform 0.3s',
        _hover: {
            transform: 'scale(1.05)',  
            boxShadow: '0 0 4px 5px #f7d086',
            
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
    
     
    const styleTitle = {
        color: 'black',
        fontWeight: 'bold',
    };

     

    const stylePtCount = {
        fontWeight: 'bold',
        color: 'black',
        fontSize: '1.2em',
        pading: 0,
        borderRadius: '10px',
        textAlign: 'right'
    };
     

    const styleArrow = {
        fontSize: preset.lengthL2,
        color: '#247a82'
    };

    const handleCardClick = () => {
        props.handleOpenItemDetailModal(index);
    };
 
    const handleEditPrizeClick = (event) => {
        event.stopPropagation();
        props.handleEditPrizeClick(index);
      };

    const handleDeletePrizeClick = (event) => {
        event.stopPropagation();
        props.handleDeletePrizeClick(index);
    };

    const handleRedeemPrizeClick = (event) => {
        event.stopPropagation();
        props.handleRedeemPrizeClick(index);
    }; 

    return (
        <Box sx={styleCard} onClick={handleCardClick} mb={3}>
            <Flex align="center" flexDirection="column" width="100%" height="100%" >
                <Box className="item-img" w="100%" backgroundPosition="center" backgroundSize="cover" >
                    <Image w="100%" h="200px" src={img_url || "./img.svg"}  alt="placeholder" />
                </Box>

                <Box className='item-desc' w="100%" h="30%" >
                    <Text className="title" sx={styleTitle}>{name}</Text>
                    <Box justifyContent="center"> {/* Set a fixed width for the description text */}
                        <Text w="80%" isTruncated>{desc}</Text>
                    </Box>
                </Box>
                <Box className='item-points' w="100%" pl={1} py={2}>
                    <Box align="right">
                        <Text className="count" bgColor="teal.100" width="fit-content" px={2} sx={stylePtCount}> Price: {cost} <span>MP</span></Text>
                    </Box>
                </Box>

                <Box w="100%" textAlign="center" height="30%" bottom="10px">
                    {props.userType === 'student' && (<>
                        <Divider borderColor="teal.500" marginTop="2px"/>
                        <Box className="actionicon" textAlign="center" py={{base:0, md:1}}>
                            <Button colorScheme="teal" onClick={handleRedeemPrizeClick}>Redeem <IoIosArrowForward /></Button>
                        </Box></>
                    )}
                    {props.userType === 'admin' && (
                        <>
                        <Divider borderColor="teal.500" marginTop="10px"/>
                        <Box className="actionicon" textAlign="center" py={{base:0, md:1}}>
                            <Button colorScheme="teal" onClick={handleEditPrizeClick}><EditIcon marginRight="5px" /> Edit </Button>
                            <Button colorScheme="red" onClick={handleDeletePrizeClick}><DeleteIcon marginRight="5px"/> Delete </Button>
                        </Box></>
                    )}
                    {props.userType === 'adminDemo' && demo === true && (
                        <>
                        <Divider borderColor="teal.500" marginTop="10px"/>
                        <Box className="actionicon" textAlign="center" py={{base:0, md:1}}>
                            <Button colorScheme="teal" onClick={handleEditPrizeClick}><EditIcon marginRight="5px" /> Edit </Button>
                            <Button colorScheme="red" onClick={handleDeletePrizeClick}><DeleteIcon marginRight="5px"/> Delete </Button>
                        </Box></>
                    )}
                    {props.userType === 'adminDemo' && demo === false && (
                        <>
                        <Divider borderColor="teal.500" marginTop="10px"/>
                        <Box className="actionicon" textAlign="center" py={{base:0, md:1}}>
                            <Button colorScheme="teal" isDisabled ><EditIcon marginRight="5px" /> Edit </Button>
                            <Button colorScheme="red" isDisabled ><DeleteIcon marginRight="5px"/> Delete </Button>
                        </Box></>
                    )}
                        
                </Box>
            </Flex>
        </Box>
    );
}
 
export default CardItem;