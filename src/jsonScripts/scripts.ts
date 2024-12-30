const fs = require('fs');
import { prisma } from "@/lib/prisma";


const saveAllCompanies = async ()=>{
  const companies = await prisma.company.findMany();
  console.log(companies);
}


saveAllCompanies();