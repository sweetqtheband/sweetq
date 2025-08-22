'use client';

import { renderChart } from "@/app/renderChart";
import { from } from "@/app/utils";
import { useEffect, useState } from "react";

export default function DashboardView({ translations, charts }: Readonly<{ translations: Record<string, any>, charts: Record<string, any> }>) {   
  let timeout:any = null;
  const [position, setPosition] = useState(from('tablet') ? 'bottom' : 'left') as [String, Function]
  const [useCharts, setUseCharts] = useState({}) as [Record<string, any>, Function]

  const updateChartsPosition = () => {    
      if (!Object.keys(useCharts).length || (from('tablet') && position !== 'bottom') || (!from('tablet') && position !== 'left')) 
      {
        const newPosition = from('tablet') ? 'bottom' : 'left';        
        setPosition(newPosition);        

        const changedCharts = Object.keys(charts).reduce((acc:any, key:string) => {      
          acc[key] = charts[key];
          acc[key].options.legend.position = newPosition;
          return acc;
        }, {});

        setUseCharts(changedCharts);
      }
  };
  
  useEffect(() => {
    updateChartsPosition();
    window.addEventListener('resize', () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => { updateChartsPosition()} , 100);      
      
    });
  }, [updateChartsPosition, timeout]);


  return (
    <div className="dashboard-view">
    {
      Object.keys(useCharts).map((key) => {
        const chart = useCharts[key];        
        return <div key={key}>{renderChart(chart)}</div>;
      })
    }
    </div>
  );
}