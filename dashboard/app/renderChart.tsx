import { CHART_TYPES } from "./constants";
import { DonutChart, MeterChart } from "@carbon/charts-react";
import { getClasses } from "./utils";

import "@carbon/charts/styles.css";

const renderRow = ({ data, options }: { data: any; options: Record<string, any> }, key: string) => {
  const className = getClasses({
    "chart-row": true,
    [`row-${data.length}`]: true,
  });

  return (
    <div className={className} key={`${key}-row-chart`}>
      {data.map((charts: Record<string, any>, index: number) => {
        const cellClassName = getClasses({
          "chart-cell": true,
          [`cell-${index}`]: true,
          [options?.cells && options.cells[index]?.className ? options.cells[index].className : ""]:
            !!(options?.cells && options.cells[index]?.className),
        });
        return (
          <div className={cellClassName} key={`${key}-row-cell-${index}`}>
            {Object.keys(charts).map((chartKey: string) => {
              const chart = charts[chartKey];
              const className = getClasses({
                chart: true,
                [`${chart.type}-chart`]: true,
                [charts[chartKey].options?.className || ""]: !!charts[chartKey].options?.className,
              });
              return (
                <div key={chartKey} className={className}>
                  {renderChart(chart, `${key}-${chartKey}`)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const renderDonut = (
  { data, options }: { data: any; options: Record<string, any> },
  key: string
) => {
  return (
    <DonutChart key={`${key}-donut-${options.legend.position}`} data={data} options={options} />
  );
};

const renderValues = (
  { data, options }: { data: any; options: Record<string, any> },
  key: string
) => {
  return (
    <div key={`${key}-values`}>
      <h5>{options.title}</h5>
      <div className="values-container">
        {data.map((item: any, index: number) => (
          <div key={`value-item-${index}`} className="value-item">
            <span className="value-label">{item.label}</span>
            <span className="value-number">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderPie = ({ data, options }: { data: any; options: Record<string, any> }, key: string) => {
  return "Hola";
};

const renderBar = ({ data, options }: { data: any; options: Record<string, any> }, key: string) => {
  return <MeterChart key={`${key}-bar`} data={data} options={options}></MeterChart>;
};

const renderSimpleBar = (
  { data, options }: { data: any; options: Record<string, any> },
  key: string
) => {
  options.meter.proportional.totalFormatter = (e: any) => e;
  options.meter.proportional.breakdownFormatter = (e: any) => {
    return `${data[0].group} ${e.datasetsTotal} (${Math.round((e.datasetsTotal * 100) / e.total)}%)`;
  };

  return renderBar({ data, options }, key);
};

const renderMultiBar = (
  { data, options }: { data: any; options: Record<string, any> },
  key: string
) => {
  options.meter.proportional.totalFormatter = (e: any) => e;
  options.meter.proportional.breakdownFormatter = (e: any) => {
    return "";
  };
  return renderBar({ data, options }, key);
};

const renderers = {
  [CHART_TYPES.DONUT]: renderDonut,
  [CHART_TYPES.VALUES]: renderValues,
  [CHART_TYPES.ROW]: renderRow,
  [CHART_TYPES.PIE]: renderPie,
  [CHART_TYPES.BAR]: renderBar,
  [CHART_TYPES.SIMPLE_BAR]: renderSimpleBar,
  [CHART_TYPES.MULTI_BAR]: renderMultiBar,
};

// Main renderer
export const renderChart = (obj: any, key: string) => {
  const { type } = obj;
  return typeof renderers[type] === "function" && renderers[type](obj, key);
};
