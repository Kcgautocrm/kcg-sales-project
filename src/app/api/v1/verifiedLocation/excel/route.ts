
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Verified Location"
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
    const page = parseInt(searchParams.get('page') || "1");
    const take = parseInt(searchParams.get('take') || "");
    const customerId = searchParams.get('customerId');
    const employeeId = searchParams.get('employeeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
  
    let myCursor = "";
    const data = await prisma.verifiedLocations.findMany({
      where: {
        ...(customerId && {customerId }),
        ...(employeeId && {employeeId }),
        ...(startDate && { timeStamp: {gte: startDate} }),
        ...(endDate && { timeStamp: {lte: endDate} }),
      },
      include: {
        customer: true,
        employee: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    let filteredData : any[]  = [...data];
    let result = filteredData.map( (item) =>{
        item.staffName = `${item?.employee?.firstName} ${item?.employee?.lastName}`;
        item.customer = item?.customer?.companyName;
        delete item?.extraData
        delete item?.employee
        delete item?.customer

        const orderedObject = {
          'id': item?.id,
          'staffName': item?.staffName,
          'customer': item?.customer,
          ...item
        }
        return Object.assign( orderedObject, item);
    })
  
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
}
