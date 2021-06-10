import React from 'react';
import {
  Pane,
  SelectField,
  Pagination as PaginationUiComponent,
} from 'evergreen-ui';

function Pagination({ pagination, setPagination, totalResults }) {
  /**
   * @desc Sets current page in pagination state
   * @param {Object} [e] The event object in js click
   */

  const handlePage = (name) => {
    // const { name } = e.target;
    if (name === 'next') {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage + 1,
      }));
    } else {
      setPagination((prev) => ({
        ...prev,
        currentPage: prev.currentPage - 1,
      }));
    }
  };

  // -----

  const handleDirectPageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  // -----

  /**
   * @desc Sets the count value in pagination state
   * @param {Object} [e] The event object in js click
   */

  const handleCountChange = (e) => {
    const { value } = e.target;
    console.log(value);
    setPagination((prev) => ({
      ...prev,
      count: value,
    }));
  };

  // -----

  /**
   * @desc Creates a readable data of the current pagination state
   * @returns {String} "start count - end count / totalResults"
   */
  function getPaginationDetails() {
    const startCount = (pagination.currentPage - 1) * pagination.count + 1;
    const endCount =
      startCount + pagination.count > totalResults
        ? totalResults
        : startCount + pagination.count;
    return `${startCount} - ${endCount} / ${totalResults}`;
  }

  return (
    <div>
      <Pane
        display="grid"
        gridTemplateColumns="auto auto"
        alignItems="center"
        gridGap={24}
      >
        <SelectField
          name="countPerPage"
          id="count-per-page"
          width={70}
          description="Per Page"
          height={40}
          value={pagination.count}
          onChange={handleCountChange}
        >
          <option value={50}>50</option>
          <option value={70}>70</option>
          <option value={100}>100</option>
        </SelectField>
        <PaginationUiComponent
          page={pagination.currentPage}
          totalPages={Math.ceil(totalResults / pagination.count)}
          onNextPage={() => handlePage('next')}
          onPreviousPage={() => handlePage('prev')}
          onPageChange={handleDirectPageChange}
        ></PaginationUiComponent>
      </Pane>
    </div>
  );
}

export default Pagination;
