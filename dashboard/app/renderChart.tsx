import { CHART_TYPES } from './constants';
import { DonutChart } from '@carbon/charts-react'
import '@carbon/charts/styles.css';


const renderDonut = ({data, options}: {data: any; options: Record<string, any>}) => {        
    return (
        <>
        <DonutChart key={`donut-${options.legend.position}`} data={data} options={options} />    
        </>

    );
}

const renderers = {
  [CHART_TYPES.DONUT]: renderDonut,
};

// Main renderer
export const renderChart = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === 'function' && renderers[type](obj);
};
