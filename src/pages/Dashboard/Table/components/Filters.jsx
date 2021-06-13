import React, { useState } from 'react';
import {
  Button,
  FilterOpenIcon,
  TextInputField,
  SmallCrossIcon,
} from 'evergreen-ui';

function Filters({ searchFilterValues, handleClearFilters, searchValues }) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleShowFilters = () => {
    setShowFilters((prev) => !prev);
  };

  return (
    <div>
      <div>
        <Button
          onClick={toggleShowFilters}
          style={
            showFilters ? { color: '#5153ff', borderColor: '#5153ff' } : {}
          }
          iconBefore={FilterOpenIcon}
          marginRight={15}
        >
          Filters
        </Button>
        <Button
          onClick={handleClearFilters}
          iconAfter={SmallCrossIcon}
          intent="danger"
        >
          Clear Filters
        </Button>
      </div>
      <div className={`filters ${!showFilters ? 'hide' : ''}`}>
        <div className="searchFilterContainer">
          <TextInputField
            name="headline"
            label=""
            value={searchValues.headline}
            onChange={searchFilterValues}
            width={200}
            description="Headline"
            placeholder="Search in headline"
          />
          <TextInputField
            name="location"
            onChange={searchFilterValues}
            label=""
            value={searchValues.location}
            width={200}
            description="Location"
            placeholder="Search in location"
          />
          <TextInputField
            label=""
            name="company"
            onChange={searchFilterValues}
            value={searchValues.company}
            width={200}
            description="Company"
            placeholder="Search in name"
          />
        </div>
      </div>
    </div>
  );
}

export default Filters;
