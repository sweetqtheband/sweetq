'use client';

import { renderChart } from "@/app/renderChart";
import { from } from "@/app/utils";
import { useCallback, useEffect, useRef, useState } from "react";

export default function DashboardView({ translations, charts }: Readonly<{ translations: Record<string, any>, charts: Record<string, any> }>) {   
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [position, setPosition] = useState(from('tablet') ? 'bottom' : 'left') as [String, Function]
  const [useCharts, setUseCharts] = useState(charts) as [Record<string, any>, Function]

  const updateChartsPosition = useCallback(() => {    
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
  }, [charts, position, useCharts]);
  
  useEffect(() => {
    updateChartsPosition();
    window.addEventListener('resize', () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => { updateChartsPosition()} , 100);      
      
    });
  }, [updateChartsPosition]);
  
  return (
    <div className="dashboard-view">
    {
      Object.keys(useCharts).map((key) => {
        const chart = useCharts[key];        
        const className = `chart ${chart.type}-chart`;
        return <div key={key} className={className}>{renderChart(chart)}</div>;
      })
    }
    </div>
  );
}