import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Text, Flex, FormControl, FormLabel, Input, Button, Toast, useToast } from "@chakra-ui/react";
import "./../components/css/Login.css";
import loginImage from "/login-image.jpg";
import { app } from "../firebase";
import {
  login, logout
} from "../controllers/Auth";

import User from '../models/User';

export default function SignupPage() {
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idnumber, setIdnumber] = useState("");
  const navigate= useNavigate();
  const toast = useToast();
 

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (name === "idnumber") setIdnumber(value); 
  };

  //account for bigger screens with longer layouts
  useEffect(() => {
      const checkScreenSize = () => {
          setIsWideScreen(window.innerWidth > (window.innerHeight +200));
      };
      checkScreenSize();
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    try {
      const success= await User.signup_new_user(email, password, idnumber);
      console.log(success)
      if(success){
        navigate("/my-dashboard");
        toast({
          title: "Signup Success",
          description: "Successfully signed up.",
          status: "success",
          position: "top",
          duration: 3000,
          isClosable: true,
        });
      }else{
        toast({
          title: "Login Error",
          description: "Invalid Information. Please try again.",
          status: "error",
          position: "top",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Login Error",
        description: "Invalid Information. Please try again.",
        status: "error",
        position: "top",
        duration: 3000,
        isClosable: true,
      });
    }
  }

    return (
      
      <Flex flexDirection={isWideScreen ? "row" : "column"} w="100%" backgroundColor="white" mx="auto" height="100%" minHeight={{ base: "calc(100vh - 136px)", md: "calc(100vh - 166px)" }}>
        {/*Login page image container*/}
      <Box className="img-container" order={{ base: "1", md: "1" }} flex="1" h="100%">
        <img 
          src={loginImage} 
          alt="Login page image"  
          style={{
            objectFit: "cover",
            width: "100%",
            height: isWideScreen ? "86vh" : "auto", // Adjust the max height as needed
            overflow: isWideScreen ? "hidden" : "auto",
          }}
        />
      </Box>

      {/*Login form container*/}
      <Box className="form-container" order={{ base: "2", md: "2" }} flex="1" h="fit-content" textAlign="center" w= {{ base: "100%", md: "80%"}} >
        <Text>Welcome! Please claim your account by entering your provided email and ID and a password of your choice.</Text>
        <form onSubmit={handleSignup}>
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email: </FormLabel>
            <Input type="email" id="email" placeholder="Enter your email" name='email' onChange={handleChange}/>
          </FormControl>

          <FormControl mt={4} isRequired>
            <FormLabel htmlFor="idnumber">ID Number: </FormLabel>
            <Input type="text" id="idnumber" placeholder="Enter your ID Number" name='idnumber' onChange={handleChange} />
          </FormControl>

          <FormControl mt={4} isRequired>
            <FormLabel htmlFor="password">Password: </FormLabel>
            <Input type="password" id="password" placeholder="Enter your password" name='password' onChange={handleChange} />
          </FormControl>
          <Link to="/login-page">
              <Text align="left" px="10px" py="5px">Already have an account? Login</Text>
            </Link>
          <Button colorScheme="teal" mt={6} type="submit">Sign Up</Button>
        </form>
      </Box>
    </Flex>
    );
}