import React, { useState } from "react";
import FilterButton from "./FilterButton";

const FilterSection = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Function to handle button clicks and set active filter
  const handleFilterClick = (label) => {
    setActiveFilter(label);
    onFilterChange(label); // Send the selected filter label to the parent
  };

  const filters = [
    { label: "All" },
    { label: "Beginner" },
    { label: "Medium" },
    { label: "Expert" },
  ];

  return (
    <div className="flex gap-2 px-5 max-md:flex-wrap">
      {filters.map((filter, index) => (
        <FilterButton
          key={index}
          label={filter.label}
          isActive={filter.label === activeFilter}
          onClick={() => handleFilterClick(filter.label)}
        />
      ))}
    </div>
  );
};

export default FilterSection;
