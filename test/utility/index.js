const chalk = require('chalk');
const { expect } = require('chai');
const { describe, it } = require('mocha');

const {
  isValidArgumentsLength,
  getUndocumentedChoice,
  endsWithWhitespace,
  replaceWhitespace,
  isEmptyString,
  isValidYamlFileName,
  getFirstKey,
  getNameFromKey,
  getParentKey,
  throwError,
} = require('../../src/utility');

describe('isValidArgumentsLength()', () => {
  it('should return true if arguments length is valid', () => {
    const result = isValidArgumentsLength({
      actual: 1,
      min: 1,
      max: 1,
      exact: 1,
    });
    expect(result).to.equal(true);
  });

  it('should return false if arguments length is more than max', () => {
    const result = isValidArgumentsLength({
      actual: 2,
      max: 1,
    });
    expect(result).to.equal(false);
  });

  it('should return false if arguments length is less than min', () => {
    const result = isValidArgumentsLength({
      actual: 1,
      min: 2,
    });
    expect(result).to.equal(false);
  });

  it('should return false if arguments length is not exact', () => {
    const result = isValidArgumentsLength({
      actual: 2,
      exact: 3,
    });
    expect(result).to.equal(false);
  });
});

describe('getUndocumentedChoice()', () => {
  it('returns the choice without the documentation', () => {
    const documentedChoice = `commit ${chalk.blue.bold('=>')} git commit -m 'new commit'`;
    const undocumentedChoice = getUndocumentedChoice(documentedChoice);
    expect(undocumentedChoice).to.equal('commit');
  });
});

describe('endsWithWhitespace()', () => {
  it('should return true if string contains whitespace', () => {
    const string = 'this string ends with whitespace    ';
    expect(endsWithWhitespace(string)).to.equal(true);
  });

  it('should return false if string does not contain whitespace', () => {
    const string = 'this string does not end with whitespace';
    expect(endsWithWhitespace(string)).to.equal(false);
  });
});

describe('replaceWhitespace()', () => {
  it('should return a string with whitespace replaced by the delimiter', () => {
    const stringWithWhitespace = 'one two three';
    expect(replaceWhitespace(stringWithWhitespace, '.')).to.equal('one.two.three');
  });

  it('should return a string with whitespace replaced by the delimiter', () => {
    const stringWithWhitespace = 'one       two three';
    expect(replaceWhitespace(stringWithWhitespace, '.')).to.equal('one.two.three');
  });
});

describe('isEmptyString()', () => {
  it('should return true if string is empty', () => {
    expect(isEmptyString('')).to.equal(true);
  });

  it('should return false if string is not empty', () => {
    expect(isEmptyString(' ')).to.equal(false);
    expect(isEmptyString('abc')).to.equal(false);
    expect(isEmptyString('\n')).to.equal(false);
  });
});

describe('isValidYamlFileName()', () => {
  it('should return true if the string is a valid yaml file name', () => {
    const fileName = 'cbf.yml';
    expect(isValidYamlFileName(fileName)).to.equal(true);
  });

  it('should return false if the string is not a valid yaml file name', () => {
    const fileNameWithDifferentFileSuffix = 'cbf.json';
    expect(isValidYamlFileName(fileNameWithDifferentFileSuffix)).to.equal(false);
    const fileNameWithNoFileSuffix = 'cbf';
    expect(isValidYamlFileName(fileNameWithNoFileSuffix)).to.equal(false);
  });
});

describe('getFirstKey()', () => {
  it('should return the first key in an object', () => {
    const object = {
      first: 1,
      second: 2,
      third: 3,
    };
    const firstKey = 'first';
    expect(getFirstKey(object)).to.equal(firstKey);
  });
});

describe('getNameFromKey()', () => {
  it('should return the name', () => {
    const key = 'one.two.three.four.five';
    const name = 'five';
    expect(getNameFromKey(key)).to.equal(name);
  });
});

describe('getParentKey()', () => {
  it('should return the parent key', () => {
    const key = 'one.two.three.four.five';
    const parentKey = 'one.two.three.four';
    expect(getParentKey(key)).to.equal(parentKey);
  });
});

describe('throwError()', () => {
  it('should throw an unknown error', () => {
    expect(() => { throwError(); }).to.throw('Unknown error');
  });

  it('should throw an error with the correct error message', () => {
    const errorMessage = 'An error';
    expect(() => { throwError(errorMessage); }).to.throw(errorMessage);
  });
});
