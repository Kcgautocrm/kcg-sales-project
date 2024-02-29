import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import formatMonth from "@/services/formatMonth";
import authService from "@/services/authService";


let routeName = "Monthly Target"
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
    const month = searchParams.get("month");
    const employeeId = searchParams.get("employeeId");
    console.log(month)
  
    let myCursor = "";
    const data = await prisma.monthlyTarget.findMany({
      where: {
        ...(month && {month}),
        ...(employeeId && {employeeId})
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        employee: {
          include: {
            invoiceRequestForms: {
              where: {approved: true}
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    let currentYear = new Date().getFullYear();
    let targetForCurrentYear = await prisma.monthlyTarget.findMany({
      where: {
        month: { contains: currentYear.toString(), mode: 'insensitive' } 
      }
    })
    let sales = await prisma.invoiceRequestForm.findMany({
      where: {
        
      }
    })
    
    let targetForCurrentYearCount = 0;
    targetForCurrentYear.forEach( monthlyTarget =>{
      targetForCurrentYearCount += parseInt(monthlyTarget.target)
    })
    const totalCount = await prisma.monthlyTarget.count()
    const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    myCursor = lastItemInData?.id // Example: 29
  
    return new NextResponse(JSON.stringify({page, take, totalCount, message: `${routeName} list fetched successfully`, data: {targetForCurrentYearCount, data: data} }), {
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

export async function POST(request: Request) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const json = await request.json();
    // validate data here
    let dataExists = await prisma.monthlyTarget.findFirst({
      where: {
        employeeId: json?.employeeId,
        month: json?.month
      }
    })
    if(dataExists){
      return new NextResponse(JSON.stringify({ message: `Target already set for employee in ${formatMonth(new Date(json?.month).getMonth())} ${new Date(json?.month).getFullYear()}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const data = await prisma.monthlyTarget.create({
      data: json,
    });
    await prisma.notification.create({
      data: {title: "Monthly Target", receiverId: data?.employeeId, resourceUrl: `/targetAchievements/${data.id}`, message: `Your Monthly Target for ${formatMonth(new Date(data?.month).getMonth())} ${new Date(data?.month).getFullYear()} has been set.` }
    })
    return new NextResponse(JSON.stringify({ message: `${routeName} Created successfully`, data }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }); 
  }
} 
