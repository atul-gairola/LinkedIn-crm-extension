import React from 'react';

function Pagination({ pagination, setPagination, totalResults }) {
  /**
   * @desc Sets current page in pagination state
   * @param {Object} [e] The event object in js click
   */

  const handlePage = async (e) => {
    const { name } = e.target;
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

  /**
   * @desc Sets the count value in pagination state
   * @param {Object} [e] The event object in js click
   */

  const handleCountChange = async (e) => {
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
      <div className="pagination">
        <p>{getPaginationDetails()}</p>
        <p>Page : {pagination.currentPage}</p>
        <button
          disabled={pagination.currentPage === 1}
          name="prev"
          onClick={handlePage}
        >
          {'<'}
        </button>
        <button
          disabled={
            pagination.currentPage ===
            Math.ceil(totalResults / pagination.count)
          }
          name="next"
          onClick={handlePage}
        >
          {'>'}
        </button>
        <select
          name="countPerPage"
          id="count-per-page"
          value={pagination.count}
          onChange={handleCountChange}
        >
          <option value={50}>50</option>
          <option value={70}>70</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

export default Pagination;
