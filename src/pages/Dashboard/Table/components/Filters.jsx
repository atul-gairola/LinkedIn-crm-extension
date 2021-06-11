import React, { useState } from 'react';
import {
  Button,
  FilterOpenIcon,
  TextInputField,
  SmallCrossIcon,
} from 'evergreen-ui';

function Filters({ handler }) {
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
        <Button iconAfter={SmallCrossIcon} intent="danger">
          Clear Filters
        </Button>
      </div>
      <div className={`filters ${!showFilters ? 'hide' : ''}`}>
        <div className="searchFilterContainer">
          <TextInputField
            name="headline"
            onChange={(e) => handler(e)}
            width={200}
            description="Headline"
            placeholder="Search in headline"
          />
          <TextInputField
            name="location"
            onChange={(e) => handler(e)}
            width={200}
            description="Location"
            placeholder="Search in location"
          />
          <TextInputField
            name="company"
            onChange={(e) => handler(e)}
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
