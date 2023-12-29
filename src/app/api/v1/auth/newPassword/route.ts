

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

type LoginCredentials = {
  oldPassword: string, 
  newPassword: string, 
  confirmPassword: string
}
type TokenData = {
  id: string;
  email: string;
  staffCadre: ["admin"] | ["salesPerson"] | ["supervisor", "salesPerson" ];
  firstName: string;
  lastName: string;
  accountType: string;
}
export async function POST(request: Request) {
  try {
    const token = (request.headers.get("Authorization") || "").split("Bearer ").at(1) as string;
    const data: LoginCredentials = await request.json();
    if(data.newPassword !== data.confirmPassword){
      return new NextResponse(JSON.stringify({message: "Passwords do not match"}), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    if(process.env.TOKEN_KEY){
      let {id,} = await jwt.verify(token, process.env.TOKEN_KEY) as TokenData;
      const employee = await prisma.employee.findUnique({
        where: {id},
      });
      if(!employee){
        return new NextResponse(JSON.stringify({message: "Employee Not Found!"}), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }); 
      }
      // verify password
      let isValid = bcrypt.compare(data.oldPassword, employee.password)
      if(!isValid){
        return new NextResponse(JSON.stringify({message: "Old password is not valid"}), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }); 
      }
      // hash password
      let encryptedPassword
      if(typeof data.newPassword === "string") encryptedPassword = await bcrypt.hash(data.newPassword, 10);

      await prisma.employee.update({
        where: { id},
        data: {password: encryptedPassword},
      });
      return new NextResponse(JSON.stringify({message: "Password Change Successful!"}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    
  } catch (error: any) {
    return new NextResponse(JSON.stringify({message: error.message}), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}