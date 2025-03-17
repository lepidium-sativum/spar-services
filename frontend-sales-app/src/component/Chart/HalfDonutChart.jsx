import React, { useEffect, useRef } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, CategoryScale } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, CategoryScale);

const HalfDonutChart = ({ value }) => {
  const needleRef = useRef(null);

  const data = {
    labels: ["Negative", "Neutral", "Positive"],
    datasets: [
      {
        data: [50, 50, 50],
        backgroundColor: ["#FC5858", "#E6DE71", "#71E684"],
        hoverOffset: 4,
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    rotation: -90,
    circumference: 180,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  useEffect(() => {
    if (needleRef.current) {
      const top = -75 * (1 - (value / 100) ** 2);
      const left = 195 + value * (80 / 100);

      needleRef.current.style.top = `${top}px`;
      needleRef.current.style.left = `${left}px`;

      const angle = ((value + 100) / 200) * 180 - 90;
      needleRef.current.style.transform = `rotate(${angle}deg)`;
    }
  }, [value]);

  // Generate tick marks for the speedometer
  const renderTicks = () => {
    const ticks = [];
    const radius = 225; // Adjust radius to align with the donut chart
    const centerX = 200; // Center X of the container (middle of the chart)
    const centerY = 200; // Center Y of the container (bottom-center for half-circle)

    const majorTickInterval = 180 / (7 - 1); // Angle between major ticks (30°)
    const minorTickInterval = majorTickInterval / (4 + 1); // Angle between minor ticks (6°)

    for (let i = -180; i <= 0; i += minorTickInterval) {
      const radians = (i * Math.PI) / 180;

      // Calculate tick positions
      const tickX = centerX + radius * Math.cos(radians);
      const tickY = centerY + radius * Math.sin(radians);

      // Check if it's a major tick
      const isMajorTick = (i + 180) % majorTickInterval === 0;

      ticks.push(
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: i % 10 === 0 ? "41px" : "15px", // Longer for major ticks
            backgroundColor: "#555555",
            top: `${tickY}px`,
            left: `${tickX}px`,
            transform: `translate(-50%, -50%) rotate(${i - 90}deg)`, // Correct rotation for alignment
            transformOrigin: "center",
          }}
        />
      );
    }
    return ticks;
  };

  return (
    <div style={{ position: "relative", width: "400px", height: "200px" }}>
      {/* Doughnut Chart */}
      <Doughnut data={data} options={options} />

      {/* Needle */}
      <div
        ref={needleRef}
        style={{
          position: "relative",
          bottom: "0",
          top: `0px`,
          left: "0px",
          width: "0",
          height: "0",
          transformOrigin: "top",
          transform: `rotate(deg)`,
          transition: "transform 0.5s ease",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="4"
          height="100"
          viewBox="0 0 10 100"
          style={{
            top: "0",
            transform: "translateY(-50%)",
          }}
        >
          <polygon points="5,0 7,100 3,100" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Render Tick Marks */}
      {renderTicks()}

      {/* Value Container */}
      <div
        style={{
          position: "relative",
          bottom: "14%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "24px",
          fontWeight: "bold",
          color: "#FFFFFF",
          width: "130px",
          height: "65px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#212123",
          borderRadius: "60px 60px 0 0",
          border: "1px solid",
          zIndex: 1,
          borderBottom: "none",
        }}
      >
        {value}
      </div>

      {/* Min and Max Labels */}
      <div
        style={{
          position: "absolute",
          bottom: "-10px",
          left: "-80px",
          fontSize: "14px",
          color: "#FF5E57",
        }}
      >
        -100
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "-10px",
          right: "-80px",
          fontSize: "14px",
          color: "#50D890",
        }}
      >
        100
      </div>
    </div>
  );
};

export default HalfDonutChart;
