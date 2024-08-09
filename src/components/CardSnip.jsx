import * as preset from './preset';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import { IoIosArrowForward } from 'react-icons/io';

const CardSnip = () => {
    //dummy data
    const data = {
        url: './img.svg',
        title: 'Title',
        text: 'this is some sample text',
    };

    //style for card
    const styleCard = {
        boxRadius: preset.lengthM3,
        backgroundColor: preset.colorMain3,
        padding: preset.lengthS3,
        borderRadius: preset.lengthM1,
        w: "100%",
        transition: 'transform 0.3s',
        _hover: {
            transform: 'scale(1.05)',
            backgroundColor: preset.colorMain3Active,
            
            '& .actionicon': {
                color: preset.colorFontMain,
            },

            '& .title': {
                color: preset.colorFontMain
            },
        },
    };

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
        fontWeight: 'bold'
    };

    const styleText = {
        color: preset.colorFontMain
    };

    const styleArrow = {
        fontSize: preset.lengthL2,
        color: preset.colorFontDisabled
    };

    return (
        <Flex sx={styleCard} align="center">
            <Box>
                <Image sx={styleImage} src={data.url} alt="placeholder" />
            </Box>

            <Box sx={styleContent}>
                <Text className="title" sx={styleTitle}>{data.title}</Text>
                <Text sx={styleText}>{data.text}</Text>
            </Box>

            <Box className="actionicon" sx={styleArrow}>
                <IoIosArrowForward />
            </Box>
        </Flex>
    );
};

export default CardSnip;
