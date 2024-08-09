import React from 'react';
import { Box, Text, Flex, Avatar, Button } from '@chakra-ui/react';
import { IoIosArrowForward } from 'react-icons/io';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import * as preset from './preset';

const CardNotification = (props) => {
    const { index, initiatorID, recipientID, notifTitle, notifDesc, notifTimestamp, notifReadStatus} = props.data; 


    // Style to be edited
    const styleCard = {
        backgroundColor: notifReadStatus ? preset.colorMain3 : "teal.100",
        padding: preset.lengthS3,
        borderRadius: preset.lengthM1,
        cursor: "pointer", 
        w: "100%",
        transition: 'transform 0.3s',
        _hover: {
            transform: 'scale(1.05)',
            backgroundColor: preset.colorMain3Active,
        },
    };

    const styleContent = {
        flex: 1,
        textAlign: 'left',
    };

    const styleTitle = {
        color: preset.colorFontLabel,
        fontWeight: 'bold',
    };

    const styleMessage = {
        color: preset.colorFontMain,
    };

    const styleTime = {
        fontSize: preset.lengthS3,
        color: "gray",
        fontWeight: 'bold',
    };

    const handleCardClick = () => {
        props.onOpenReadModal(index); 
    };

    return (
        <Box onClick={handleCardClick}>
            <Flex sx={styleCard} align="center">
                <Avatar name={notifTitle} size="sm" mr="10px" />

                <Box sx={styleContent} isTruncated>
                    <Text sx={styleTitle}>{notifTitle}</Text>
                    <Text sx={styleMessage}><pre>{notifDesc.split('\n')[0]}</pre></Text> {/* keep newline for */}
                </Box>

                <Text sx={styleTime}>
                {new Date(notifTimestamp.seconds * 1000).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                })} <br/> {new Date(notifTimestamp.seconds * 1000).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit'
                })}
                    </Text>

                <Button colorScheme="teal" rightIcon={<IoIosArrowForward />} >
                    View
                </Button>
            </Flex>
        </Box>
    );
}

export default CardNotification;
