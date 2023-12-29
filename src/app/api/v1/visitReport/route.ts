import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";



let routeName = "Visit Report"
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
    const state = searchParams.get('state');
    const companyName = searchParams.get('companyName');
    const isActive = searchParams.get('isActive');

    if(approved === "approved"){
      approved = true
    }else if(approved === "unApproved"){
      approved = false
    }else{
      approved === null
    }
  
    let myCursor = "";
    let data = await prisma.customer.findMany({
      where: {
        ...(isActive && {isActive: true}),
        ...(employeeId && { employeeId }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false },] } : { approved }),
        ...(state && { state }),
        ...(companyName && { companyName: { contains: companyName, mode: 'insensitive' } }),
      },
      ...(Boolean(take) && {take}),
      ...((Boolean(page) && Boolean(take)) && {skip: (page - 1) * take}),
      ...(myCursor !== "" && {
        cursor: {
          id: myCursor,
        }
      }),
      include: {
        employee: true,
        _count: {
          select: {visitReports: true}
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    data = data.filter( item => item._count.visitReports > 0);

    if(!data){
      return new NextResponse(JSON.stringify({ message: `Failed to fetch ${routeName} list`, data: null}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    let totalData = await prisma.customer.findMany({
      where: {
        ...(isActive && {isActive: true}),
        ...(employeeId && { employeeId }),
        ...(approved === null ? { OR: [{ approved: true }, { approved: false },] } : { approved }),
        ...(state && { state }),
        ...(companyName && { companyName: { contains: companyName, mode: 'insensitive' } }),
      },
      include: {
        _count: {
          select: {visitReports: true}
        }
      },
    })
    totalData = totalData.filter( item => item._count.visitReports > 0);
    const lastItemInData = data[(page * take) - 1] // Remember: zero-based index! :)
    myCursor = lastItemInData?.id // Example: 29
  
    return new NextResponse(JSON.stringify({page, take, totalCount: totalData.length, message: `${routeName} list fetched successfully`, data }), {
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
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    // create visit report with data
    const json = await request.json();
    // validate data here
    const data = await prisma.visitReport.create({
      data: json,
    });

    // update last visited in customer model
    await prisma.customer.update({
      where: {
        id: json.customerId
      },
      data: {lastVisited: json.visitDate}
    })
    return new NextResponse(JSON.stringify({ message: `${routeName} Created successfully`, data }), { 
     status: 201, 
     headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
} 
