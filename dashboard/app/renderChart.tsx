import { CHART_TYPES } from "./constants";
import { DonutChart, MeterChart } from "@carbon/charts-react";
import { getClasses } from "./utils";

import "@carbon/charts/styles.css";

const renderRow = ({ data }: { data: any }) => {
  const className = getClasses({
    "chart-row": true,
    [`row-${data.length}`]: true,
  });

  return (
    <div className={className}>
      {data.map((charts: Record<string, any>) => {
        return (
          <div className="chart-cell">
            {Object.keys(charts).map((key: string) => {
              const chart = charts[key];
              const className = `chart ${chart.type}-chart`;
              return (
                <div key={key} className={className}>
                  {renderChart(chart)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const renderDonut = ({ data, options }: { data: any; options: Record<string, any> }) => {
  return <DonutChart key={`donut-${options.legend.position}`} data={data} options={options} />;
};

const renderValues = ({ data, options }: { data: any; options: Record<string, any> }) => {
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
};

const renderPie = ({ data, options }: { data: any; options: Record<string, any> }) => {
  return "Hola";
};
const renderBar = ({ data, options }: { data: any; options: Record<string, any> }) => {
  options.meter.proportional.totalFormatter = (e: any) => e;
  options.meter.proportional.breakdownFormatter = (e: any) => {
    return `${data[0].group} ${e.datasetsTotal} (${Math.round((e.datasetsTotal * 100) / e.total)}%)`;
  };

  return <MeterChart data={data} options={options}></MeterChart>;
};

const renderers = {
  [CHART_TYPES.DONUT]: renderDonut,
  [CHART_TYPES.VALUES]: renderValues,
  [CHART_TYPES.ROW]: renderRow,
  [CHART_TYPES.PIE]: renderPie,
  [CHART_TYPES.BAR]: renderBar,
};

// Main renderer
export const renderChart = (obj: any) => {
  const { type } = obj;
  return typeof renderers[type] === "function" && renderers[type](obj);
};
