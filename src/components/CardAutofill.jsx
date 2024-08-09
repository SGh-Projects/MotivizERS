import * as preset from './preset';
import PropTypes from 'prop-types';
import { Box, Text, Image, Flex, Avatar } from '@chakra-ui/react';

const CardAutofill = ({url, title, text, avatar}) => {

    //style for card
    const styleCard = {
        boxRadius: preset.lengthM3,
        backgroundColor: preset.colorMain3,
        padding: preset.lengthS3,
        w: "100%",
        transition: 'transform 0.3s',
        _hover: {
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
                {avatar ? (
                    avatar // Display the avatar if provided
                ) : (
                    <Image sx={styleImage} src={imageUrl} alt="placeholder" /> // Fallback to the image
                )}
            </Box>

            <Box sx={styleContent}>
                <Text className="title" sx={styleTitle}>{title}</Text>
                <Text className="text" sx={styleText}>{text}</Text>
            </Box>
        </Flex>
    );
};

CardAutofill.propTypes = {
    avatar: PropTypes.element,
    url: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  };

export default CardAutofill;
