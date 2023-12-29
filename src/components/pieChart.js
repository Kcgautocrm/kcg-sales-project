import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import formatMonth from '@/services/formatMonth';

/* const data1 = [
  { label: 'Current Achievement', value: 8 },
  { label: 'Pending Achievement', value: 12 }
];

const data2 = [
  { label: `Total`, value: 20 },
]; */

export default function AppPieChart({arrayOfData = [], totalOverride}) {

  const getTotal = () =>{
    let total = 0;
    arrayOfData.forEach( item =>{
      total += parseInt(item.value)
    })
    return { label: "Total", value: totalOverride || total}
  }


  if(arrayOfData.length === 0){
    return null
  }
  return (
    <PieChart
      series={[
        {
          innerRadius: 0,
          outerRadius: 80,
          data: arrayOfData,
        },
        {
          innerRadius: 100,
          outerRadius: 120,
          data: [getTotal()],
        },
      ]}
      width={500}
      height={120}
      slotProps={{
        legend: { hidden: true },
      }}
    />
  );
}