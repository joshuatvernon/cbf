#!/usr/bin/env node

const chalk = require('chalk');
const isUndefined = require('lodash/isUndefined');
const isArray = require('lodash/isArray');
const isEmpty = require('lodash/isEmpty');
const isString = require('lodash/isString');

const isEmptyString = s => isString(s) && isEmpty(s);

const {
  PRIMARY_COLOUR,
  SECONDARY_COLOUR,
  ERROR_COLOUR,
  DEFAULT_SEPARATOR,
} = require('../constants');

const colours = {
  black: 'black',
  red: 'red',
  green: 'green',
  yellow: 'yellow',
  blue: 'blue',
  magenta: 'magenta',
  cyan: 'cyan',
  white: 'white',
  gray: 'gray',
  primary: PRIMARY_COLOUR,
  secondary: SECONDARY_COLOUR,
  error: ERROR_COLOUR,
};

/**
 * Colourise a message by replacing colour markers with chalk colours
 *
 * @argument string message - an unformatted string message to colourise
 */
const colouriseMessage = message => {
  let colourisedMessage = message;
  Object.keys(colours).forEach(colourKey => {
    const colourTagsRegex = new RegExp(`<${colourKey}>[\\s\\S]*?<${colourKey}>`, 'g');
    colourisedMessage = colourisedMessage.replace(colourTagsRegex, match => {
      const colourTagRegex = new RegExp(`<${colourKey}>`, 'g');
      return chalk[colours[colourKey]](match.replace(colourTagRegex, ''));
    });
  });
  return colourisedMessage;
};

/**
 * Replace the placeholders in the unformatted message with the value
 *
 * @argument string message - an unformatted string message to format
 * @argument string placeholder - a placeholder to look for and replace in the message
 * @argument any value - a value to replace the placeholder with in the message
 *
 * @returns string message - message with placeholders formatted
 */
const replacePlaceholders = (message, placeholder, value) => {
  const optionRegex = new RegExp(`{${placeholder}}`, 'g');
  if (isEmptyString(value) || !isUndefined(value)) {
    return message.replace(optionRegex, value);
  }
  return message;
};

/**
 * Replace the placeholders in the unformatted message with the array of values
 *
 * @argument string message - an unformatted string message to format
 * @argument string placeholder - a placeholder to look for and replace in the message
 * @argument array values - an array of values to replace the placeholder with in the message
 * @argument string separator - a separator to separate the values when adding them to the message
 *
 * @returns string message - message with array placeholders formatted
 */
const replaceArrayPlaceholders = (message, placeholder, values, separator) => {
  const arrayRegex = new RegExp(`\\[${placeholder}\\]`, 'g');
  if (isArray(values) && isEmpty(values)) {
    return message.replace(arrayRegex, '');
  }
  if (isArray(values)) {
    return message.replace(arrayRegex, values.join(separator));
  }
  return message;
};

/**
 * Formats a message and returns it
 *
 * @argument Object unformattedMessage - an unformatted message to format
 * @argument Object options - an object containing properties to replace in the message
 *
 * @returns string message - formatted message
 */
const formatMessage = (unformattedMessage, options = {}) => {
  if (isUndefined(unformattedMessage)) {
    throw new Error('Cannot format message as `unformattedMessage` is undefined');
  }

  let { message } = unformattedMessage;
  if (isUndefined(message)) {
    throw new Error('Cannot format unformattedMessage as `message` property is undefined');
  }
  // Combine defaultOptions and options -- options will override defaultOptions
  const combinedOptions = {
    separator: DEFAULT_SEPARATOR,
    ...unformattedMessage.defaultOptions,
    ...options,
  };

  Object.keys(combinedOptions)
    .filter(optionKey => optionKey !== 'separator')
    .forEach(optionKey => {
      // Replace placeholders with options
      message = replacePlaceholders(message, optionKey, combinedOptions[optionKey]);
      // Replace array placeholder with array items
      message = replaceArrayPlaceholders(
        message,
        optionKey,
        combinedOptions[optionKey],
        combinedOptions.separator,
      );
    });

  // Replace colour placeholders with chalk colour
  message = colouriseMessage(message);

  return message;
};

/**
 * Prints a message to the console
 *
 * @argument string message - a string message to be printed to the console
 */
const printMessage = message => {
  // eslint-disable-next-line no-console
  console.log(message);
};

module.exports = {
  printMessage,
  formatMessage,
};
