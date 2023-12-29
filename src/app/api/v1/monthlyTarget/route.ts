import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import formatMonth from "@/services/formatMonth";
import authService from "@/services/authService";


let routeName = "Monthly Targets"
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
  
    let myCursor = "";
    const data = await prisma.monthlyTarget.findMany({
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
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
    const data = await prisma.monthlyTarget.create({
      data: json,
    });
    await prisma.notification.create({
      data: {title: "Monthly Target", staffCadre: "salesPerson", resourceUrl: `/targetAchievements/${data.id}`, message: `Monthly Target for ${data.month} has been set.` }
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
