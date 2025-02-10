import * as JsonParser from './json-parser.js';

describe('parse json test', () => { 

    test('Test for {}', async () => {
        const testData = '{}';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(true);
    });

    test('Test for {{', async () => {
        const testData = '{{';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(false);
    });

    test('Test for }}', async () => {
        const testData = '{{';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(false);
    });

    test('Test for }', async () => {
        const testData = '{{';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(false);
    });

    test('Test for {', async () => {
        const testData = '{{';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(false);
    });

    test('Test for {"key" : "value"}', async () => {
        const testData = '{"key" : "value"}';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(true);
    });

    test('Test for {"key" : null}', async () => {
        const testData = '{"key" : null}';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(true);
    });

    test('Test for {"key" : "value"}', async () => {
        const testData = '{"key" : true }';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(true);
    });

    test('Test for {"key" : "value"}', async () => {
        const testData = '{"key" : false}';
        const result = await JsonParser.parseData(testData);
        expect(result).toEqual(true);
    });

});