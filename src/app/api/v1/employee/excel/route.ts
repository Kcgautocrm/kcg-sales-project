
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";


let routeName = "Employee"
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

    let data = await prisma.employee.findMany({
        include: {
            company: {
                select: {
                    name: true
                }
            },
            branch: {
                select: {
                    name: true,
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
    let filteredData : any[]  = [...data];
    filteredData.forEach( (item) =>{
        item.companyName = item?.company?.name;
        item.branchName = item?.branch?.name;
        item.staffCadre = item?.staffCadre[0];
        item.brandsAssigned = item.brandsAssigned.join(", ")
        delete item?.company
        delete item?.branch
        delete item?.companyId
        delete item?.branchId
        delete item?.extraData
        delete item?.password
    })
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data: filteredData }), {
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