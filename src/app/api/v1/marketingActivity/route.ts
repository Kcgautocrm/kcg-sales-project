import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadImage } from "@/services/imageService";
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
    const page = parseInt(searchParams.get('page') || "1");
    const take = parseInt(searchParams.get('take') || "");
    const employeeId = searchParams.get('employeeId');
    let approved: any = searchParams.get('approved');

    if(approved === "approved"){
      approved = true
    }else if(approved === "unApproved"){
      approved = false
    }else{
      approved === null
    }
  
    let myCursor = "";
    const data = await prisma.markettingActivity.findMany({
      where: {
        ...(employeeId && { employeeId }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false }] } : { approved }),
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        employee: true
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
    const totalCount = await prisma.markettingActivity.count({
      where: {
        ...(employeeId && { employeeId }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false },] } : { approved }),
      },
    })
    const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    myCursor = lastItemInData?.id // Example: 29
  
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
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const json = await request.json();
    const data = await prisma.markettingActivity.create({
      data: json,
    });
    /* await prisma.notification.create({
      data: {staffCadre: "admin", resourceUrl: `/marketingActivities/${data.id}`, message: "Marketing Activity created (pending approval)" }
    }) */
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
