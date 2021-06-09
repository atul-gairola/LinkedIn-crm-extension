import React from 'react';

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
        <select
          name="sorting"
          id="sorting"
          value={sorting}
          onChange={handleSorting}
        >
          <option value="fullName_asc">Name (asc)</option>
          <option value="fullName_desc">Name (desc)</option>
          <option value="connectedAt_asc">Connected At (asc)</option>
          <option value="connectedAt_desc">Connected At (desc)</option>
        </select>
      </div>
    </div>
  );
}

export default Sorting;
