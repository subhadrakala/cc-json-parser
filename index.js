import { open } from 'node:fs/promises';
import { parseData } from './json-parser.js';

const args = process.argv.slice(2);
let fileInfo = args[0];
const fd = await open(fileInfo);
let json = await fd.readFile("utf8");

let result = await parseData(json);
console.log(result);