import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";

let modelName = "Visit Report"
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const singleReport = searchParams.get('singleReport');

    const id = params.id;
    let data;
    if(singleReport){
      data = await prisma.visitReport.findUnique({
        where: {
          id
        },
        include: {
          customer: true,
          contactPerson: true
        }
      });
    }else {
      data = await prisma.visitReport.findMany({
        where: {
          customerId: id,
          isActive: true
        },
        include: {
          customer: true,
          contactPerson: true
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    }

  
    return new NextResponse(JSON.stringify({message: `${modelName}s fetched successfully`, data }), {
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string }}
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    let json = await request.json();
  
    const updatedData: any = await prisma.visitReport.update({
      where: { id },
      data: json,
    });

    // when a visit report is updated, check if the visit date is more current than the lastVisited date on customer
    // if so update the last visited to the visit date
    // also check if the last follow-up visit date is more current than the lastVisited date on customer
    // if so update the last visited date to the last follow-up visit date.
    // Hope that is clear 
    const customer: any = await prisma.customer.findUnique({
      where: {id: updatedData.customerId}
    })
    if(json?.followUpVisits.length){
      let lastVisit = json?.followUpVisits[json?.followUpVisits?.length - 1];
      // check if lastVisit meeting Date is greater than customer last visited date
      let isLatestVisit = new Date(lastVisit.meetingDate).getTime() > new Date(customer?.lastVisited).getTime()
      if(lastVisit && isLatestVisit){
        await prisma.customer.update({
          where: {
            id: updatedData.customerId
          },
          data: {lastVisited: lastVisit?.meetingDate}
        })
      }
      // this is correct
      if(lastVisit?.nextVisitDate && new Date(lastVisit.nextVisitDate).getTime() > new Date(updatedData?.nextVisitDate).getTime()){
        await prisma.visitReport.update({
          where: {
            id: updatedData.id
          },
          data: {nextVisitDate: lastVisit.nextVisitDate}
        })
      }
    }
    if(json?.visitDate && new Date(json?.visitDate).getTime() > new Date(customer?.lastVisited).getTime()){
      await prisma.customer.update({
        where: {
          id: json?.customerId
        },
        data: {lastVisited: json.visitDate}
      })
    }
    
  
    if (!updatedData) {
      return new NextResponse(JSON.stringify({message: `${modelName} with ID not found`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
  
    return new NextResponse(JSON.stringify({ message: `${modelName} updated successfully`, data: updatedData}), {
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    let {isAuthorized} = await authService(token, ["supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    await prisma.visitReport.delete({
      where: { id },
    });
    return new NextResponse(JSON.stringify({message: `${modelName} deleted with Id: ${id}`}), {
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

