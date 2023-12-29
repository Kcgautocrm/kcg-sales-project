import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "comment"
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
    const take = parseInt(searchParams.get('take') || "10");
    const resourceId = searchParams.get("resourceId");
    //const offers = await prisma.offer.findMany()

    let myCursor = "";
    const data = await prisma.comment.findMany({
      where: {
        viewed: false,
        ...(resourceId && {resourceId})
      },
      include:{
        sender: true
      }
      /* take: take,
      skip: (page - 1) * take,
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }) */
      
    })
    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const totalCount = await prisma.comment.count({
      where: {
        viewed: false,
        ...(resourceId && {resourceId})
      }
    })
    //const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    //myCursor = lastItemInData?.id // Example: 29

    return new NextResponse(JSON.stringify({page, take, totalCount, message: `${routeName} list fetched successfully`, data }), {
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

export async function POST(request: Request) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized, staffCadre} = await authService(token, ["admin", "supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const json = await request.json();
    // validate data here
    const data = await prisma.comment.create({
      data: json,
    });

    if(staffCadre === "admin"){
      // notify salesPerson
      await prisma.notification.create({
        data: {receiverId: data?.receiverId, resourceUrl: data.resourceUrl, message: "Admin commented on your resource" }
      })
      // notify supervisor
      const employeeData = await prisma.employee.findFirst({
        where: {id: data.receiverId}
      });
      if(employeeData?.supervisorId){
        await prisma.notification.create({
          data: {receiverId: employeeData?.supervisorId, resourceUrl: data.resourceUrl, message: "Admin commented on your subordinate's resource" }
        })
      }

    }else if( staffCadre === "salesPerson"){
      // notify admin
      await prisma.notification.create({
        data: {staffCadre: "admin", resourceUrl: data.resourceUrl, message: "Sales Person made a comment on resource" }
      })
      // notify supervisor
      const employeeData = await prisma.employee.findFirst({
        where: {id: data.receiverId}
      });
      if(employeeData?.supervisorId){
        await prisma.notification.create({
          data: {receiverId: employeeData?.supervisorId, resourceUrl: data.resourceUrl, message: "Your subordinate commented on a resource" }
        })
      }
    }else if( staffCadre === "supervisor"){
      // notify admin 
      await prisma.notification.create({
        data: {staffCadre: "admin", resourceUrl: data.resourceUrl, message: "Supervisor made a comment on resource" }
      })
      // notify salesPerson
      await prisma.notification.create({
        data: {receiverId: data?.receiverId, resourceUrl: data.resourceUrl, message: "Your supervisor commented on your resource" }
      })
    }
    return new NextResponse(JSON.stringify({ message: `${routeName} Created successfully`, data }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: error.message}), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 
