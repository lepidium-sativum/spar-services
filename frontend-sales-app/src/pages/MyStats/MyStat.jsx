import React, { useState } from "react";
import CanvasJSReact from "@canvasjs/react-charts";
import MyTable from "./myTable";

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const options = {
  animationEnabled: true,
  theme: "dark1",
  title: {
    text: "Progress Timeline",
  },
  axisY: {
    title: "Stars Count",
    logarithmic: true,
  },
  data: [
    {
      type: "spline",
      showInLegend: true,
      // legendText: "MWp = one megawatt peak",
      dataPoints: [
        { x: new Date(2001, 0), y: 1615 },
        { x: new Date(2002, 0), y: 2069 },
        { x: new Date(2003, 0), y: 2635 },
        { x: new Date(2004, 0), y: 3723 },
        { x: new Date(2005, 0), y: 5112 },
        { x: new Date(2006, 0), y: 6660 },
        { x: new Date(2007, 0), y: 9183 },
        { x: new Date(2008, 0), y: 15844 },
        { x: new Date(2009, 0), y: 23185 },
        { x: new Date(2010, 0), y: 40336 },
        { x: new Date(2011, 0), y: 70469 },
        { x: new Date(2012, 0), y: 100504 },
        { x: new Date(2013, 0), y: 138856 },
        { x: new Date(2014, 0), y: 178391 },
        { x: new Date(2015, 0), y: 229300 },
        { x: new Date(2016, 0), y: 302300 },
        { x: new Date(2017, 0), y: 405000 },
      ],
    },
  ],
};

const options2 = {
  animationEnabled: true,
  theme: "dark1",
  title: {
    text: "Customer Satisfaction",
  },
  subtitles: [
    {
      text: "80% Positive",
      verticalAlign: "center",
      fontSize: 24,
      dockInsidePlotArea: true,
    },
  ],
  data: [
    {
      type: "doughnut",
      showInLegend: true,
      indexLabel: "{name}: {y}",
      yValueFormatString: "#,###'%'",
      dataPoints: [
        { name: "Satisfied", y: 20 },
        { name: "Unsatisfied", y: 5 },
      ],
    },
  ],
};

const MyStats = () => {
  let [fromDate, setFromDate] = useState("");
  let [toDate, setToDate] = useState("");
  return (
    <div>
      <div className="flex justify-between items-center w-full bg-gray-600 p-4 rounded-md shadow-md">
        <h1 className="text-xl font-semibold text-gray-100">All Stars</h1>
        <div className="flex items-center space-x-4">
          <div className="flex flex-row justify-center items-center">
            <label htmlFor="fromDate" className="text-sm text-gray-100 mx-5">
              From
            </label>
            <input
              type="date"
              id="fromDate"
              className="text-gray-100 bg-gray-600 mt-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-row justify-center items-center">
            <label htmlFor="toDate" className="text-sm text-gray-100  mx-5">
              To
            </label>
            <input
              type="date"
              id="toDate"
              className="text-gray-100 bg-gray-600 mt-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>
      <CanvasJSChart options={options} />
      <br />
      <br />
      <div className="flex flex-row justify-evenly items-center">
        <div className="w-[400px]">
          <CanvasJSChart options={options2} />
        </div>
        <div>
          <h2 className="text-lg font-large text-gray-100">Top Modules</h2>
          <MyTable />
        </div>
      </div>
    </div>
  );
};

export default MyStats;
