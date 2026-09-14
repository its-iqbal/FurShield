/**
 * utils/sendResponse.js
 * Centralised JSON response helper so all controllers return a
 * consistent shape: { success, message, data, meta? }
 */

/**
 * @param {import('express').Response} res
 * @param {number}  statusCode
 * @param {*}       data        - payload (object, array, or null)
 * @param {string}  [message]
 * @param {object}  [meta]      - optional pagination / extra meta
 */
const sendResponse = (res, statusCode, data, message = 'Success', meta = null) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
};

export default sendResponse;
