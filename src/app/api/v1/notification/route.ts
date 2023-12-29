import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Notification"
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
    const employeeId = searchParams.get("employeeId");
    const staffCadre = searchParams.get("staffCadre");
    console.log("employeeId:", employeeId, " staffCadre:", staffCadre)
    //const offers = await prisma.offer.findMany()
    let whereObject = {}
    if(staffCadre === "admin"){
      whereObject = {
        staffCadre: "admin",
        viewed: false
      }
    }else{
      whereObject = {
        OR: [
          {
            receiverId: employeeId,
            viewed: false
          },
          {
            staffCadre: "salesPerson",
            NOT: { viewedBy: {has: employeeId}}
          }
        ]
      }
    }
  
    const data = await prisma.notification.findMany({
      where: whereObject,
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
    //const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    //myCursor = lastItemInData?.id // Example: 29
  
    return new NextResponse(JSON.stringify({/* page, take, */ totalCount: data.length, message: `${routeName} list fetched successfully`, data }), {
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
    let {isAuthorized} = await authService(token, ["admin", "supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const json = await request.json();
    // validate data here
    const data = await prisma.notification.create({
      data: json,
    });
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
