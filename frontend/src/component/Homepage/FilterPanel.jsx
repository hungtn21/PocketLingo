import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import "./FilterPanel.css";

const FilterPanel = ({ filters, onChange, filterOptions }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleRatingChange = (type, value) => {
    const newRating = { ...filters.rating };

    // Validate rating input
    if (
      value === "" ||
      (parseFloat(value) >= 1.0 && parseFloat(value) <= 5.0)
    ) {
      newRating[type] = value;
      onChange({ ...filters, rating: newRating });
    }
  };

  return (
    <div className="filter-panel">
      <button className="filter-toggle" onClick={() => setIsOpen(!isOpen)}>
        <Filter size={20} />
        Bộ lọc
      </button>

      {isOpen && (
        <div className="filter-dropdown">
          <h3 className="filter-title">Bộ lọc</h3>

          <div className="filter-group">
            <label className="filter-label">Cấp độ</label>
            <select
              className="filter-select"
              value={filters.level}
              onChange={(e) => handleFilterChange("level", e.target.value)}
            >
              <option value="">ALL</option>
              {filterOptions.levels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ngôn ngữ</label>
            <select
              className="filter-select"
              value={filters.language}
              onChange={(e) => handleFilterChange("language", e.target.value)}
            >
              <option value="">ALL</option>
              {filterOptions.languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Đánh giá</label>
            <div className="rating-inputs">
              <input
                type="number"
                className="rating-input"
                placeholder="1.0"
                min="1.0"
                max="5.0"
                step="0.1"
                value={filters.rating.min}
                onChange={(e) => handleRatingChange("min", e.target.value)}
              />
              <span className="rating-separator">-</span>
              <input
                type="number"
                className="rating-input"
                placeholder="5.0"
                min="1.0"
                max="5.0"
                step="0.1"
                value={filters.rating.max}
                onChange={(e) => handleRatingChange("max", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
