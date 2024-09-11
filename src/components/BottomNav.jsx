import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./css/BottomNav.css";

const BottomNav = ({ userType }) => {
  /*edit to use the appropriate 3 icons to suit the user type when we implement backend for login
    for now we can place the different ones on the navbar
  */
    const location = useLocation();

  
    const renderMiddleIcon = () => {
        if (userType === "student" || userType === "admin" || userType === 'adminDemo') {
          return (
            <Link to="/merit-shop" >
              <div className="middleNavItem"> 
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-shop" viewBox="0 0 16 16">
                  <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h1v-5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v5h6V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5M4 15h3v-5H4zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zm3 0h-2v3h2z"/>
                </svg>
                <span>Merit Shop</span>
              </div>
            </Link>
          );
        } else if (userType === "staff") {
          return (
            <Link to="/assign-points" >
              <div className="middleNavItem"> 
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-patch-plus-fill" viewBox="0 0 16 16">
                <path d="M10.067,.87a2.89,2.89,0,0,0-4.134,0l-.622.638-.89-.011a2.89,2.89,0,0,0-2.924,2.924l.01.89-.636.622a2.89,2.89,0,0,0,0,4.134l.637.622-.011.89a2.89,2.89,0,0,0,2.924,2.924l.89-.01.622.636a2.89,2.89,0,0,0,4.134,0l.622-.637.89.011a2.89,2.89,0,0,0,2.924-2.924l-.01-.89.636-.622a2.89,2.89,0,0,0,0-4.134l-.637-.622.011-.89a2.89,2.89,0,0,0-2.924-2.924l-.89.01ZM8.5,6v1.5H10a.5.5,0,0,1,0,1H8.5V10a.5.5,0,0,1-1,0V8.5H6a.5.5,0,0,1,0-1h1.5V6a.5.5,0,0,1,1,0"/>

                </svg>
                  <span>Assign Points</span>
              </div>
            </Link>
          );
      }
    };
  
    const renderIcons = () => {
      // Check if the current path is login-page or signup-page
      if (location.pathname === "/" || location.pathname === "/login-page"  || location.pathname === "/signup-page") {
        return null;
      } 
      else { //if not signup/login pages render icons
        return (
          <>
          <Link to="/leaderboard" >
            <div className="leftNavItem">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-award-fill" viewBox="0 0 16 16">
              <path d="m8 0 1.669.864 1.858.282.842 1.68 1.337 1.32L13.4 6l.306 1.854-1.337 1.32-.842 1.68-1.858.282L8 12l-1.669-.864-1.858-.282-.842-1.68-1.337-1.32L2.6 6l-.306-1.854 1.337-1.32.842-1.68L6.331.864z"/>
              <path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
            </svg>
              <span>Merit</span>
            </div>
          </Link>

          {renderMiddleIcon()}

          <Link to="/course-page" >
            <div className="rightNavItem">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-book-half" viewBox="0 0 16 16">
              <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
            </svg>
              <span>Courses</span>
            </div>
          </Link>
        </>
        );
      }
    }

    return (
      <nav className="bottomNav">
        {renderIcons()}
      </nav>
    );
}
export default BottomNav;