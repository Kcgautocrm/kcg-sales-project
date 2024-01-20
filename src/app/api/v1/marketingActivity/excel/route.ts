
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Marketing Activity"
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

    let data = await prisma.markettingActivity.findMany({
        include: {
            employee: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
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
    filteredData.forEach( (item) =>{
        item.staffName = `${item?.employee?.firstName} ${item.employee?.lastName}`
        delete item?.images
        delete item?.documents
        delete item?.extraData
        delete item?.employeeId
        delete item?.employee
    })
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data: filteredData }), {
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