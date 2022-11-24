'use strict';

exports.sortObject = function sortObject(obj) {
  if (typeof obj !== 'object') throw new Error('Invalid object passed');
  const objCopy = { ...obj };
  const objKeys = Object.keys(obj);
  // eslint-disable-next-line no-param-reassign
  objKeys.forEach((key) => delete obj[key]);
  [...objKeys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))].forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    obj[key] = objCopy[key];
  });
  return obj;
};
