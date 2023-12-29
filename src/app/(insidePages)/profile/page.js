"use client"

import Link from "next/link";
import useGetUserData from "@/hooks/useGetUserData";
import ChangePassword from "./changePassword";



const styles = {
  card: {
    width: "clamp(350px, 100%, 650px)",
  }
}

const Profile = () => {
  const {logout, userData} = useGetUserData()
  return (
    <div className="container-fluid">
      <header className="d-flex align-items-center mb-4">
        <h4 className="m-0">Profile</h4>
      </header>

      <section className=''>
        <div className='d-flex align-items-center primary-bg p-3 rounded-3' style={styles.card}>
          {/* <AvatarClient /> */}
          <div className="d-flex flex-column small ms-2">
            <span className="fw-bold text-dark"> {userData?.firstName} {userData?.lastName}</span>
            <span className="">{userData?.email} </span>
          </div>
          <button onClick={logout} className='btn btn-link text-danger ms-auto text-decoration-none fw-bolder' href="/auth/login"> Log Out</button>
        </div>

        <div className='d-flex align-items-center primary-bg p-3 rounded-3 mt-3 shadow-sm border' style={styles.card}>
          <div className="d-flex flex-column small ms-2">
            <span className="fw-bold"> Edit Profile</span>
          </div>
          <i className="fa-solid fa-angle-right ms-auto"></i>
        </div>

        <a href="#changePassword" data-bs-toggle="offcanvas" aria-expanded="false" aria-label="Toggle navigation" className='d-flex align-items-center primary-bg p-3 rounded-3 mt-3 shadow-sm text-dark border' style={styles.card}>
          <span className="d-flex flex-column small ms-2">
            <span className="fw-bold"> Change Password</span>
          </span>
          <i className="fa-solid fa-angle-right ms-auto"></i>
        </a>

      </section>

      <div className="offcanvas primary-bg offcanvas-end gap-1 p-3" data-bs-scroll="true" id="changePassword" tabIndex="-1">
        <ChangePassword />
      </div>
    </div>
  )
}

export default Profile