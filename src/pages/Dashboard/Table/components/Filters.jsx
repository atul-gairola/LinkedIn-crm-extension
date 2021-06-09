import React, { useCallback } from 'react';
import { debounce } from 'debounce';

function Filters({ setFilters }) {
  /**
   * @desc Set searchIn and search in filters state
   * @param {Object} [e] The event object in js click
   */

  const handleSearch = (e) => {
    const { value, name } = e.target;
    setFilters((prev) => {
      let searchIn =
        value === '' ? [...prev.searchIn] : [...prev.searchIn, name];
      let search = value === '' ? [...prev.search] : [...prev.search, value];

      if (value === '') {
        const index = searchIn.indexOf(name);
        if (index !== -1) {
          searchIn = [...prev.searchIn];
          searchIn.splice(index, 1);
          search = [...prev.search];
          search.splice(index, 1);
        }
      } else {
        const index = prev.searchIn.indexOf(name);
        if (index !== -1) {
          searchIn = [...prev.searchIn];
          const searchArr = [...prev.search];
          searchArr[index] = value;
          search = searchArr;
        }
      }

      console.log('Search In: ', searchIn);
      console.log('search: ', search);

      return { ...prev, searchIn: searchIn, search: search };
    });
  };

  const handler = useCallback(debounce(handleSearch, 300), []);

  // -----
  return (
    <div>
      <div className="filters">
        <label>Search Name</label>
        <input type="text" name="fullName" onChange={(e) => handler(e)} />
        <label>Search Headline</label>
        <input type="text" name="headline" onChange={(e) => handler(e)} />
        <label>Search Location</label>
        <input type="text" name="location" onChange={(e) => handler(e)} />
        <label>Search Company</label>
        <input type="text" name="company" onChange={(e) => handler(e)} />
      </div>
    </div>
  );
}

export default Filters;
