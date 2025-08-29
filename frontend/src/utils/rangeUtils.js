// utils/rangeUtils.js

/**
 * Gets the appropriate normal range based on patient data and available ranges
 * @param {Object|Map} normalRange - The normal range object from test definition
 * @param {Object} patientData - Patient information (gender, age, isPregnant, etc.)
 * @returns {Object|null} The selected range object or null if not found
 */
export const getNormalRange = (normalRange, patientData = {}) => {
  if (!normalRange) return null;
  
  // Handle both Map and object formats
  let rangeObj = normalRange;
  if (normalRange instanceof Map) {
    rangeObj = Object.fromEntries(normalRange);
  }
  
  const gender = patientData?.gender?.toLowerCase();
  
  // Priority 1: Try to find range based on patient-specific criteria
  if (patientData) {
    // Check for pregnancy status
    if (patientData.isPregnant) {
      if (rangeObj["Pregnant Female"]) return rangeObj["Pregnant Female"];
      if (rangeObj["Pregnant(borderline Gestational age)"]) 
        return rangeObj["Pregnant(borderline Gestational age)"];
    }
    
    // Check for age-based ranges
    if (patientData.age) {
      const age = parseInt(patientData.age);
      if (!isNaN(age)) {
        if (age < 1 && rangeObj["New Born"]) return rangeObj["New Born"];
        if (age < 18 && rangeObj["Children"]) return rangeObj["Children"];
        if (age >= 65 && rangeObj["Elderly"]) return rangeObj["Elderly"];
        if (age >= 18 && rangeObj["Adult"]) return rangeObj["Adult"];
        if (age >= 18 && rangeObj["Adults"]) return rangeObj["Adults"];
      }
    }
    
    // Check for gender-specific ranges
    if (gender) {
      if (rangeObj[gender]) return rangeObj[gender];
      if (rangeObj[gender.charAt(0).toUpperCase() + gender.slice(1)]) 
        return rangeObj[gender.charAt(0).toUpperCase() + gender.slice(1)];
      if (rangeObj["feMale"]) return rangeObj["feMale"]; // Handle typo
    }
  }
  
  // Priority 2: Look for general categories
  if (rangeObj["Normal"]) return rangeObj["Normal"];
  if (rangeObj["Negative"]) return rangeObj["Negative"];
  
  // Priority 3: Return the first available range if no specific match
  const firstKey = Object.keys(rangeObj)[0];
  if (firstKey) return rangeObj[firstKey];
  
  return null;
};

/**
 * Checks if a value is within the normal range
 * @param {string|number} value - The test result value
 * @param {Object|Map} normalRange - The normal range object
 * @param {Object} patientData - Patient information
 * @returns {boolean|null} True if normal, false if abnormal, null if cannot determine
 */
export const isValueNormal = (value, normalRange, patientData = {}) => {
  if (!normalRange || value === undefined || value === null || value === "") 
    return null;
  
  const range = getNormalRange(normalRange, patientData);
  if (!range) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return null;
  
  // Handle different range formats
  let min, max;
  
  if (typeof range.min === 'string') {
    min = parseFloat(range.min);
  } else {
    min = range.min;
  }
  
  if (typeof range.max === 'string') {
    max = parseFloat(range.max);
  } else {
    max = range.max;
  }
  
  if (min === undefined || max === undefined || isNaN(min) || isNaN(max)) 
    return null;
  
  return numValue >= min && numValue <= max;
};

/**
 * Formats the normal range for display
 * @param {Object|Map} normalRange - The normal range object
 * @param {Object} patientData - Patient information
 * @returns {string} Formatted range string
 */
export const formatNormalRange = (normalRange, patientData = {}) => {
  if (!normalRange) return "Range not defined";
  
  const range = getNormalRange(normalRange, patientData);
  if (!range) {
    // Show all available ranges for this field
    const rangeObj = normalRange instanceof Map ? 
      Object.fromEntries(normalRange) : normalRange;
    
    const ranges = Object.entries(rangeObj)
      .filter(([_, value]) => value && (value.min !== undefined || value.max !== undefined))
      .map(([label, value]) => {
        const min = value.min !== undefined ? value.min : "N/A";
        const max = value.max !== undefined ? value.max : "N/A";
        return `${label}: ${min} - ${max}`;
      });
    
    return ranges.length > 0 ? ranges.join(" | ") : "No ranges available";
  }
  
  const min = range.min !== undefined ? range.min : "N/A";
  const max = range.max !== undefined ? range.max : "N/A";
  
  return `${min} - ${max}`;
};

/**
 * Gets the label of the range being used
 * @param {Object|Map} normalRange - The normal range object
 * @param {Object} patientData - Patient information
 * @returns {string} The range label
 */
export const getRangeLabel = (normalRange, patientData = {}) => {
  if (!normalRange) return "Custom";
  
  const range = getNormalRange(normalRange, patientData);
  if (!range) return "Multiple ranges";
  
  // Find which label this range corresponds to
  const rangeObj = normalRange instanceof Map ? 
    Object.fromEntries(normalRange) : normalRange;
  
  for (const [label, value] of Object.entries(rangeObj)) {
    if (value === range || 
        (value && value.min === range.min && value.max === range.max)) {
      return label;
    }
  }
  
  return "Selected range";
};

/**
 * Gets all available range labels for a test field
 * @param {Object|Map} normalRange - The normal range object
 * @returns {Array} Array of available range labels
 */
export const getAvailableRangeLabels = (normalRange) => {
  if (!normalRange) return [];
  
  const rangeObj = normalRange instanceof Map ? 
    Object.fromEntries(normalRange) : normalRange;
  
  return Object.keys(rangeObj).filter(key => 
    rangeObj[key] && (rangeObj[key].min !== undefined || rangeObj[key].max !== undefined)
  );
};

/**
 * Gets range for a specific label
 * @param {Object|Map} normalRange - The normal range object
 * @param {string} label - The specific label to get range for
 * @returns {Object|null} The range object or null if not found
 */
export const getRangeByLabel = (normalRange, label) => {
  if (!normalRange || !label) return null;
  
  const rangeObj = normalRange instanceof Map ? 
    Object.fromEntries(normalRange) : normalRange;
  
  return rangeObj[label] || null;
};

/**
 * Gets appropriate range based on custom criteria (override patient data)
 * @param {Object|Map} normalRange - The normal range object
 * @param {Object} criteria - Custom criteria {gender, age, isPregnant, label}
 * @returns {Object|null} The selected range object
 */
export const getRangeByCriteria = (normalRange, criteria = {}) => {
  if (!normalRange) return null;
  
  const rangeObj = normalRange instanceof Map ? 
    Object.fromEntries(normalRange) : normalRange;
  
  // If specific label is provided, use it
  if (criteria.label && rangeObj[criteria.label]) {
    return rangeObj[criteria.label];
  }
  
  // Otherwise use the same logic as getNormalRange but with custom criteria
  if (criteria.isPregnant) {
    if (rangeObj["Pregnant Female"]) return rangeObj["Pregnant Female"];
    if (rangeObj["Pregnant(borderline Gestational age)"]) 
      return rangeObj["Pregnant(borderline Gestational age)"];
  }
  
  if (criteria.age) {
    const age = parseInt(criteria.age);
    if (!isNaN(age)) {
      if (age < 1 && rangeObj["New Born"]) return rangeObj["New Born"];
      if (age < 18 && rangeObj["Children"]) return rangeObj["Children"];
      if (age >= 65 && rangeObj["Elderly"]) return rangeObj["Elderly"];
      if (age >= 18 && rangeObj["Adult"]) return rangeObj["Adult"];
      if (age >= 18 && rangeObj["Adults"]) return rangeObj["Adults"];
    }
  }
  
  if (criteria.gender) {
    const gender = criteria.gender.toLowerCase();
    if (rangeObj[gender]) return rangeObj[gender];
    if (rangeObj[gender.charAt(0).toUpperCase() + gender.slice(1)]) 
      return rangeObj[gender.charAt(0).toUpperCase() + gender.slice(1)];
    if (rangeObj["feMale"]) return rangeObj["feMale"];
  }
  
  if (rangeObj["Normal"]) return rangeObj["Normal"];
  if (rangeObj["Negative"]) return rangeObj["Negative"];
  
  const firstKey = Object.keys(rangeObj)[0];
  if (firstKey) return rangeObj[firstKey];
  
  return null;
};