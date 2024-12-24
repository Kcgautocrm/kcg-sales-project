
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import reOrderObject from "@/services/reorderObjectKeys";


let routeName = "Contact Person"
export async function GET(request: Request) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin", "supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const isActive = searchParams.get("isActive");
    const customerId = searchParams.get('customerId') ;

    let data = await prisma.contactPerson.findMany({
      where: {
        ...(customerId && {customerId}),
        ...(employeeId && {employeeId}),
        ...(isActive && {isActive: true})
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        customer: {
          select: {
            companyName: true,
            address: true,
            lga: true,
            city: true,
            state: true,
            approved: true
          }
        }
      },
        orderBy: {
          createdAt: "desc"
        }
    })
    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    let filteredData : any[]  = [...data];
    let result = filteredData.map( (item) =>{
        item.staffName = `${item?.employee?.firstName} ${item?.employee?.lastName}`;
        item.companyName = item?.customer?.companyName
        item.address = `${item?.customer?.address} ${item?.customer?.lga}, ${item?.customer?.city}, ${item?.customer?.state}`;
        item.approved = item?.customer?.approved
        delete item?.extraData
        delete item?.employee
        delete item?.employeeId
        delete item?.customer
        delete item?.customerId

        let orderedObject = reOrderObject(item, ["id", "staffName", "companyName", "address", "approved", "name", "designation", "phoneNumber", "email", "createdAt", "updatedAt" ]);
        return orderedObject
    })
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}