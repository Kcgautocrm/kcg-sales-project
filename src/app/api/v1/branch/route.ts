import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Branch"
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
    const companyId = searchParams.get("companyId");
    const isActive = searchParams.get("isActive");

    let myCursor = "";
    const data = await prisma.branch.findMany({
      where: {
        ...(isActive && {isActive: true}),
        ...(companyId && {companyId}),
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        company: {
          select: {
            name: true
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
    const totalCount = await prisma.branch.count({
      where: {
        ...(companyId && {companyId}),
        ...(isActive && {isActive: true})
      }
    })
    const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    myCursor = lastItemInData?.id // Example: 29

    return new NextResponse(JSON.stringify({page, take, totalCount, message: `${routeName} list fetched successfully`, data }), {
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
    
    let {code} = json;
    let codeExists = await prisma.branch.findFirst({ where: {code}})
    if(codeExists){
      return new NextResponse(JSON.stringify({ message: `Branch with code "${code}" already exists`}), { 
        status: 400, 
        headers: { "Content-Type": "application/json" },
       });
    }
    const data = await prisma.branch.create({
      data: json,
    });
    return new NextResponse(JSON.stringify({ message: `${routeName} Created successfully`, data }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
     });
  }
} 
