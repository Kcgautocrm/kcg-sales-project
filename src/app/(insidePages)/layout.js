/* eslint-disable @next/next/no-img-element */
"use client"
import { useEffect, useLayoutEffect, useState } from "react";
import AsideContent from "../../components/asideContent";
import AppNotifications from "../../components/appNotifications";
import useGetNotifications from "@/hooks/useGetNotifications";
import useGetUserData from "@/hooks/useGetUserData";
import { useRouter } from "next/navigation";
import Link from "next/link";

const styles = {
  notificationIcon: {
    fontSize: ".7rem", 
    position: "relative", 
    left: "-10px", 
    top: "-10px",
    height: "15px",
    width: "15px"
  }
}

const Layout = ({ children }) => {
  const [key, setKey] = useState("")
  const {isAllowed, userData, logout, switchAccountType} = useGetUserData();
  const {count} = useGetNotifications();

  return (
    <div className="page-wrapper" id="main-wrapper" data-layout="vertical" data-navbarbg="skin6" data-sidebartype="full"
      data-sidebar-position="fixed" data-header-position="fixed">

      <aside className="offcanvas offcanvas-start px-4" style={{maxWidth: "300px"}} tabIndex={-1} id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <AsideContent />
      </aside>

      <aside className="left-sidebar">
        <AsideContent />
      </aside>

      <main className="body-wrapper">

        <header className="app-header">
          <nav className="navbar navbar-expand-lg navbar-light">
            <ul className="navbar-nav">
              <li className="nav-item d-block d-xl-none">
                <a className="nav-link sidebartoggler nav-icon-hover" id="headerCollapse"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">
                  <i className="ti ti-menu-2"></i>
                </a>
              </li>
            </ul>
            <div className="navbar-collapse justify-content-end px-0" id="navbarNav">
              <ul className="navbar-nav flex-row ms-auto align-items-center justify-content-end">
                {userData.staffCadre.includes("supervisor") &&
                <li className="nav-item dropdown">
                  <a className="nav-link nav-icon-hover" href="" id="drop2" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i className="fa-solid fa-repeat"></i>
                  </a>
                  
                  <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop2">
                    <h6 className="small m-0 m-3">Switch Account to:</h6>
                    <div className="message-body">
                      <a href="/" className="d-flex align-items-center gap-2 dropdown-item" onClick={()=>switchAccountType("Sales Person")}>
                        <i className="fa-regular fa-user" style={{fontSize: "16px"}}></i>
                        <p className="mb-0 fs-3">Sales Person</p>
                      </a>
                      <a href="/" className="d-flex align-items-center gap-2 dropdown-item" onClick={()=>switchAccountType("Supervisor")}>
                        <i className="fa-solid fa-user-large" style={{fontSize: "16px"}}></i>
                        <p className="mb-0 fs-3">Supervisor</p>
                      </a>
                    </div>
                  </div>
                </li>}
                {/* <li className="nav-item">
                  <a className="nav-link p-2 nav-icon-hover" >
                    <i className="fa-regular fa-message fs-6"></i>
                  </a>
                </li> */}
                <li className="nav-item">
                  <a className="nav-link p-2 nav-icon-hover"  data-bs-toggle="offcanvas" href="#offcanvasExample22" role="button" aria-controls="offcanvasExample22">
                    <i className="ti ti-bell-ringing"></i>
                    {count > 0 && <span className="badge bg-primary rounded-circle p-1 small d-flex align-items-center justify-content-center" style={styles.notificationIcon}>{count}</span>}
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link nav-icon-hover" href="" id="drop2" data-bs-toggle="dropdown"
                    aria-expanded="false">
                    {userData?.staffCadre?.length > 0 && <img src={`/images/profile/${userData?.staffCadre[0]}.jpeg`} alt="" width="35" height="35" className="rounded-circle" />}
                  </a>
                  <div className="dropdown-menu dropdown-menu-end dropdown-menu-animate-up" aria-labelledby="drop2">
                    <div className="message-body">
                      <div className="px-3">
                        <h6 className="text-capitalize m-0">{userData?.firstName} {userData?.lastName}</h6>
                        <p className="text-capitalize small">{`${userData?.accountType || userData?.staffCadre[0]}`}</p>
                      </div>
                      
                      <Link href="/profile" className="d-flex align-items-center gap-2 dropdown-item">
                        <i className="ti ti-user fs-6"></i>
                        <span className="mb-0 fs-3">My Profile</span>
                      </Link>
                      <a onClick={logout} className="btn btn-outline-primary mx-3 mt-2 d-block">Logout</a>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </nav>
        </header>

        {isAllowed && children}
      </main>
      <AppNotifications />
    </div>
  )
}


export default Layout