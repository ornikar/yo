'use strict';

exports.sortObject = function sortObject(obj) {
  if (typeof obj !== 'object') throw new Error('Invalid object passed');
  const objCopy = { ...obj };
  const objKeys = Object.keys(obj);
  objKeys.forEach((key) => delete obj[key]);
  [...objKeys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))].forEach((key) => {
    obj[key] = objCopy[key];
  });
  return obj;
};
