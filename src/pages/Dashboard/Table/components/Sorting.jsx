import React from 'react';
import { SelectField, option } from 'evergreen-ui';

function Sorting({ sorting, setSorting }) {
  /**
   * @desc Sets the sorting state
   * @param {Object} [e] The event object in js click
   */

  const handleSorting = (e) => {
    const { value } = e.target;
    setSorting(value);
  };

  // -----
  return (
    <div>
      <div className="sorting">
        <SelectField
          description="Sorting"
          value={sorting}
          name="sorting"
          id="sorting"
          onChange={handleSorting}
          width={240}
          height={40}
        >
          <option value="fullName_asc">Name (asc)</option>
          <option value="fullName_desc">Name (desc)</option>
          <option value="connectedAt_asc">Connected At (asc)</option>
          <option value="connectedAt_desc">Connected At (desc)</option>
        </SelectField>
      </div>
    </div>
  );
}

export default Sorting;
