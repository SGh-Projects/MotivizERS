import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Menu, MenuButton, MenuList, MenuItem, MenuDivider, Avatar, useBreakpointValue, useToast, Flex} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import './css/TopNav.css';
import { logout } from "../controllers/Auth";
import { getAuth } from "firebase/auth";
import { get_current_user } from "../controllers/Auth";
import { has_unread_notifications, listenForNotifications } from "../controllers/Notifications";
import { NotificationProvider, useNotificationContext } from "../controllers/NotificationProvider";


function TopNav() {
    const auth = getAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const {hasUnreadNotifications, setHasUnreadNotifications} = useNotificationContext();;
    const navigate = useNavigate();
    const toast = useToast();
    const [userRec, setUserRec] = useState(null)

    // Check whether user logged in or not
    useEffect(() => {
        const handleAuthStateChange = async (user) => {
            setIsLoggedIn(!!user);
            if (user) {
                const uRec = await get_current_user();
                setUserRec(uRec);
                setUserEmail(user.email); // Set the email if user is logged in
                setHasUnreadNotifications(await has_unread_notifications()); // Update unread notifications from context
            }
        };
        const authListener = auth.onAuthStateChanged(handleAuthStateChange);
        return () => authListener(); // Cleanup when component unmounts
    }, [auth, setHasUnreadNotifications]);

    useEffect(() => {
        if (userRec) {
            const unsubscribe = listenForNotifications(userRec.id, (hasUnread) => {
                setHasUnreadNotifications(hasUnread);
            });
    
            return () => unsubscribe();
        }
    }, [userRec, setHasUnreadNotifications]);
    

    const subtitles = {
        '/': 'Student Incentive System',
        '/notifications': 'Notifications',
        '/merit-shop': 'Merit Shop',
        '/leaderboard': 'Leaderboard Rankings',
        '/awards': 'Awards page',
        '/course-page': 'Courses',
        '/profile-page': 'Profile',
        '/login-page': 'Login',
        '/signup-page': 'Signup',
        '/my-dashboard': 'My Dashboard',
    };

    // Handle the routes with dynamic paths
    const generateSubtitle = (pathname) => {
        if (subtitles[pathname]) {
            return subtitles[pathname];
        } else if (pathname.startsWith('/course-student')) {
            return 'Course Students';
        } else if (pathname.startsWith('/assign-points')) {
            return 'Assign Points';
        } else {
            return 'Student Incentive System';
        }
    };

    
    const subtitle = generateSubtitle(window.location.pathname);
    const bellBoxSize = useBreakpointValue({ base: "1.5em", md: "2em" });
    const avatarBoxSize = useBreakpointValue({ base: "1.5em", md: "2em" });

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login-page");
            toast({
                title: "Logout Success",
                description: "Successfully logged out.",
                status: "success",
                position: "top",
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <nav className="topNav">
            <div className="navTitle">
                <Link to="/"><img src="/logo.png" alt="Logo" className="logo" /></Link>
                <div>
                    {isLoggedIn ? (
                        <>
                            <Link to="/my-dashboard"><h1>MotivizERS</h1></Link>
                            <h2>{subtitle}</h2>
                        </>
                    ) : (
                        <Flex flexDirection="column" style={{textAlign: "left"}}><h1>MotivizERS Demo</h1>
                        <h2 style={{backgroundColor: "darkred", padding: "5px", fontFamily: "Calibri", fontWeight: "bold"}}>
                            Note that this is a demo therefore some functions will be unavailable for use. See the Github readme file for login credentials.

                        </h2>
                        </Flex>
                    )}
                </div>
            </div>

            {isLoggedIn && (
                <div className="navActions">
                    <Link to="/notifications">
                        <Box position="relative">
                            <BellIcon boxSize={bellBoxSize} className="bell-icon" />
                            {hasUnreadNotifications && (
                                <Box position="absolute" top="12px" right="15px" h="8px" w="8px" bg="red.500" borderRadius="full"/>
                            )}
                        </Box>
                    </Link>

                    <Menu className='profile-menu'>
                        <MenuButton className="menu-button" _hover={{ bg: 'teal.200', border: '1px #fee6bc solid' }} _focus={{ bg: 'teal.200', outline: 'none' }} display="flex" _expanded={{ bg: 'teal.200' }}>
                            <Avatar boxSize={avatarBoxSize} src="" />
                            <ChevronDownIcon ml={1} mt={3} />
                        </MenuButton>
                        <MenuList color="teal.500" minWidth="fit-content" fontSize={13} padding="none" mt={-1} height="fit-content">
                            <MenuItem as="Box" style={{ fontWeight: 'bold' }}>{userEmail}</MenuItem>
                            <MenuDivider />
                            <Link  to="/profile-page" ><MenuItem border="none" width="95%" _hover={{ bg: 'teal.400', color: 'white', boxShadow: "none" }}>My Profile</MenuItem></Link>
                            <Link to="/my-dashboard"><MenuItem border="none" width="95%" _hover={{ bg: 'teal.400', color: 'white', border: "none" }}>My Dashboard</MenuItem></Link>
                            <MenuDivider />
                            <MenuItem border="none" width="95%" _hover={{ bg: 'teal.400', color: 'white', border: "none" }} onClick={handleLogout}>Log Out</MenuItem>
                        </MenuList>
                    </Menu>
                    </div>
            )}
        </nav>
    );
}

export default TopNav;
