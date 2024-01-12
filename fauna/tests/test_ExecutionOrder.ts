import { ExecutionOrder } from "../src/taskExecution/ExecutionOrder.js";
import fs from 'fs';
import path from 'path';

const DATA_DIRECTORY_PATH = './tests/data';
function getAllFilePaths(directoryPath: string): string[] {
    return fs.readdirSync(directoryPath).reduce<string[]>((fileArray, file) => {
        const filePath = path.join(directoryPath, file);
        const fileStat = fs.statSync(filePath);

        return fileStat.isDirectory()
            ? [...fileArray, ...getAllFilePaths(filePath)]
            : [...fileArray, filePath];
    }, []);
}

const filePaths = getAllFilePaths(DATA_DIRECTORY_PATH);

// Execute for each file in the data directory
filePaths.forEach(fp => {
    console.log("###############################################################");
    console.log("For file path: " + fp + " , here are the execution order:");
    new ExecutionOrder().parseFile(fp);
    console.log("###############################################################\n\n");
});