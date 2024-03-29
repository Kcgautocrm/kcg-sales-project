import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import generateDeleteResourceMsg from "@/services/generateDeleteResourceMsg";

let modelName = "Customer"
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


    const id = params.id;
    const data = await prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        employee: true,
        contactPersons: true
      }
    });
  
    if (!data) {
      return new NextResponse(JSON.stringify({message: `${modelName} with ID Not Found!`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
  
    return new NextResponse(JSON.stringify({message: `${modelName} fetched successfully`, data }), {
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
    let {isAuthorized} = await authService(token, ["admin", "supervisor", "salesPerson"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = params.id;
    let json = await request.json();

    const updatedData = await prisma.customer.update({
      where: { id },
      data: json,
    });
    if(action === "approve"){
      await prisma.notification.create({
        data: { title: "Customer", receiverId: updatedData.employeeId, resourceUrl: `/customers/${updatedData.id}`, message: `${updatedData.companyName} has been approved as your customer`}
      })
    }else if( action === "disapprove"){
      await prisma.notification.create({
        data: { title: "Customer", receiverId: updatedData.employeeId, resourceUrl: `/customers/${updatedData.id}`, message: `${updatedData.companyName} has been dissaproved as your customer`}
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
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }


    const id = params.id;
    const data = await prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        _count: { 
          select: {
            contactPersons: true,
            visitReports: true,
            pfiRequestForms: true,
            invoiceRequestForms: true
          }
        }
      },
    });
    
    /* let errorMsg = generateDeleteResourceMsg(data?._count)
    if(errorMsg){
      return new NextResponse(JSON.stringify({ message: `${modelName} cannot be deleted. ${errorMsg} are assigned to this ${modelName}`, data: data }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    } */

    
    await prisma.customer.delete({
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

