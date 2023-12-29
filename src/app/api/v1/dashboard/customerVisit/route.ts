import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";



let routeName = "Customer Visits"
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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
  
    let data  = await prisma.visitReport.findMany({
      where: {
        ...(employeeId && { employeeId }),
      },
      select:{
        id: true,
        customer: {
          select: {
            companyName: true
          }
        },
        contactPerson: {
          select: {
            name: true
          }
        },
        employeeId: true,
        createdAt: true,
        nextVisitDate: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    }) 

    console.log(startDate, endDate)

    if(data.length > 0 && startDate && endDate){

      data = data.filter( item =>( 
        item?.nextVisitDate && 
        parseInt(startDate) <= new Date(item?.nextVisitDate).getTime() && 
        parseInt(endDate) >= new Date(item?.nextVisitDate).getTime()
      ))
    }


    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }); 
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
}
