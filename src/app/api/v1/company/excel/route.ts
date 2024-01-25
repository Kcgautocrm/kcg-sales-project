
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import authService from "@/services/authService";
import type { Company } from "@prisma/client";
import reOrderObject from "@/services/reorderObjectKeys";


let routeName = "Company"
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

    let data = await prisma.company.findMany({
        include: {
            _count: {
                select: {
                    branches: true
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
    let result = filteredData.map( (item) =>{
        item.numOfBranches = item?._count.branches;
        item.brands = item.brands.join(", ")
        delete item?._count
        delete item?.extraData

        let orderedObject = reOrderObject(item, ["id", "name", "numOfBranches", "code", "brands", "email", "address", "logo", "isActive", "createdAt", "updatedAt" ]);
        return orderedObject
    }) 
    return new NextResponse(JSON.stringify({ message: `${routeName} list fetched successfully`, data: result }), {
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