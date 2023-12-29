import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as jwt from 'jsonwebtoken';
import {sendResetPasswordEmail} from "@/services/sendEmail";

export async function POST(request: Request) {
  try {
    const data: {email: string} = await request.json();
    let user = await prisma.employee.findUnique({
      where: {email: data.email}
    })
    if(!user){
      return new NextResponse(JSON.stringify({message: `User with email Not Found!`}), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.TOKEN_KEY as string,
      {
        expiresIn: "8h",
      }
    );
    //send email
    await sendResetPasswordEmail({firstName: user.firstName, middleName: user?.middleName, lastName: user.lastName, email: user.email, token: token })

    return new NextResponse(JSON.stringify({message: `A Reset Password Link was sent to your email: ${user.email}`}), {
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