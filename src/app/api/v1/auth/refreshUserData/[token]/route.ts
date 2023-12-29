import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as jwt from 'jsonwebtoken';

type TokenData = {
  id: string
  email: string
}

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if(process.env.TOKEN_KEY){
      jwt.verify(token, process.env.TOKEN_KEY, function(err, decoded) {
        if (err) {
          return new NextResponse(JSON.stringify({message: decoded}), { status: 503 });
        }
      });
      let {id} = await jwt.verify(token, process.env.TOKEN_KEY) as TokenData;
      
      const user: any = await prisma.employee.findUnique({
        where: {
          id
        },
      });
      if(!user){
        return new NextResponse(JSON.stringify({message: "User Not Found!"}), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }); 
      }
      // Create token
      const newToken = jwt.sign(
        { id: user.id, email: user.email, staffCadre: user.staffCadre, firstName: user.firstName, lastName: user.lastName },
        process.env.TOKEN_KEY as string,
        {
          expiresIn: "40 days",
        }
      );
      // add token to user object
      user.token = newToken;
      // return new user
      delete user.password;
      return new NextResponse(JSON.stringify({message: "User Data Refreshed", data: user}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }); 
    }
    
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return new NextResponse(JSON.stringify({message: error.message}), { status: 500 });
  }
}