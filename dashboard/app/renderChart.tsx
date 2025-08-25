import { CHART_TYPES } from './constants';
import { DonutChart } from '@carbon/charts-react'
import { getClasses } from './utils';

import '@carbon/charts/styles.css';


const renderDonut = ({data, options}: {data: any; options: Record<string, any>}) => {        
    const className = getClasses({
      'chart': true,
      'donut-chart': true,        
    });
    return (        
      <DonutChart key={`donut-${options.legend.position}`} data={data} options={options} />                  
    );
}


const renderValues = ({data, options}: {data: any; options: Record<string, any>}) => {        
    const className = getClasses({
      'chart': true,
      'values-chart': true,        
    });
    return (        
        <>
            <h5>{options.title}</h5>
            <div className="values-container">
                {data.map((item: any, index: number) => (
                    <div key={`value-item-${index}`} className="value-item">
                        <span className="value-label">{item.label}</span>
                        <span className="value-number">{item.value}</span>
                    </div>
                ))}
            </div>
        </>
    );
}


const renderers = {
  [CHART_TYPES.DONUT]: renderDonut,
  [CHART_TYPES.VALUES]: renderValues,
};

// Main renderer
export const renderChart = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === 'function' && renderers[type](obj);
};
