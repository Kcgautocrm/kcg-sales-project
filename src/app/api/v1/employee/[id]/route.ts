import { prisma } from "@/lib/prisma";
import { UUID } from "crypto";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import generateDeleteResourceMsg from "@/services/generateDeleteResourceMsg";
import bcrypt from 'bcryptjs';

let modelName = "Employee"
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
    const data = await prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        company: true,
        branch: true,
      }
    });
    if(data) data.password = ""
    const supervisor =  await prisma.employee.findUnique({
      where: {
        id: (data?.supervisorId === null ? "" : data?.supervisorId) as string 
      },
    });
    const subordinates = await prisma.employee.findMany({
      where: {
        supervisorId: data?.id 
      },
    });
  
    if (!data) {
      return new NextResponse(JSON.stringify({message: `${modelName} with ID Not Found!`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
  
    return new NextResponse(JSON.stringify({message: `${modelName} fetched successfully`, data: {...data, supervisor, subordinates} }), {
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
    let {isAuthorized} = await authService(token, ["admin"])
    if(!isAuthorized){
      return new NextResponse(JSON.stringify({ message: `UnAuthorized`, data: null}), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const id = params.id;
    let data = await request.json();
    let encryptedPassword;
    if(data.password) encryptedPassword = await bcrypt.hash(data.password, 10);
    if(encryptedPassword) data.password = encryptedPassword;

    const updatedData = await prisma.employee.update({
      where: { id },
      data: data,
    });

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
    const data = await prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        _count: { 
          select: {
            customers: true,
            contactPersons: true,
            visitReports: true,
            pfiRequestForms: true,
            invoiceRequestForms: true,
            MarkettingActivities: true,
            sentComments: true,
            receivedComments: true
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


    await prisma.employee.delete({
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

