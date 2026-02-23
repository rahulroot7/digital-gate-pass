const regexFilter = (val)=>{
    const removeExtraSpaces = val?.replace(/\s+/g, " ")?.trim()
    const escapedValue = removeExtraSpaces?.trim()?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = new RegExp(escapedValue, 'i');
    return escapedValue;
}

module.exports = regexFilter;