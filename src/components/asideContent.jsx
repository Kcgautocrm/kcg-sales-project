"use client"
import { usePathname } from "next/navigation";
import path from "path";
import { useSelector } from "react-redux";
import { getDecodedToken } from "@/services/localStorageService";
import useGetUserData from "@/hooks/useGetUserData";
import Link from "next/link";


const SidebarListItem = ({ route, title, active, iconClass, classes }) => {
  
  return (
    <li className="sidebar-item my-1">
      <Link className={`sidebar-link ${active && "active"} ${classes} d-flex align-items-center`} href={`${route}`} aria-expanded="false">
        <span>
          <i className={`${iconClass}`}></i>
        </span>
        <span className="hide-menu">{title}</span>
      </Link>
    </li>
  )
}

const AsideContent = () => {
  const pathname = usePathname();
  const {userData} = useGetUserData();

  return (
    <nav className="sidebar-nav scroll-sidebar h-100" data-simplebar="">
      <div className="brand-logo d-flex align-items-center mb-4 p-0">
        <a href="/" className="text-nowrap logo-img">
          <h4>KCG-Sales-Project</h4>
          <h6 className="text-capitalize"><span className="text-muted">{userData?.firstName} {userData?.lastName}</span> - {`${userData?.accountType || (userData?.staffCadre[0] || "") }`}</h6>
        </a>
        <div className="close-btn d-xl-none d-block sidebartoggler cursor-pointer ms-auto" id="sidebarCollapse" data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="ti ti-x fs-6"></i>
        </div>
      </div>
      <ul id="sidebarnav">
        <SidebarListItem route="/" title="Dashboard" active={pathname === "/"} iconClass="fa-solid fa-chart-line" />
        <SidebarListItem route="/companies" classes={!userData?.staffCadre?.includes("admin") ? "d-none" : ""} title="Companies" active={pathname.includes("/companies")} iconClass="fa-regular fa-building" />
        <SidebarListItem route="/brands" classes={!userData?.staffCadre?.includes("admin") ? "d-none" : ""} title="Brands" active={pathname.includes("/brands")} iconClass="fa-solid fa-trademark"/>
        <SidebarListItem route="/products" title="Products" active={pathname.includes("/products")} iconClass="fa-solid fa-car-rear" />
        <SidebarListItem route="/priceMaster" title="Price Master" active={pathname.includes("/priceMaster")} iconClass="fa-regular fa-money-bill-1" />
        <SidebarListItem route="/employees" classes={!userData?.staffCadre?.includes("admin") ? "d-none" : ""} title="Employees" active={pathname.includes("/employees")} iconClass="fa-solid fa-user" />
        <SidebarListItem route="/customers" title="Customers" active={pathname.includes("/customers")} iconClass="fa-solid fa-city" />
        <SidebarListItem route="/visits" title="Visit Reports" active={pathname.includes("/visits")} iconClass="fa-solid fa-calendar-days" />
        <SidebarListItem route="/pfiRequests" title="Pfi Requests" active={pathname.includes("/pfiRequests")} iconClass="fa-solid fa-file-lines" />
        <SidebarListItem route="/invoiceRequests" title="Invoice Requests" active={pathname.includes("/invoiceRequests")} iconClass="fa-solid fa-receipt" />
        <SidebarListItem route="/marketingActivities" title="Marketing Activities" active={pathname.includes("/marketingActivities")} iconClass="fa-solid fa-rocket" />
        <SidebarListItem route="/targetAchievements" title="Target & Achievements" active={pathname.includes("/targetAchievements")} iconClass="fa-solid fa-bullseye" />
      </ul>
    </nav>
  )
}

export default AsideContent;