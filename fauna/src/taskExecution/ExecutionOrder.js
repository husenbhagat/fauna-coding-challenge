import * as fs from 'fs';
export class ExecutionOrder {
    parseFile(filename) {
        // Read the file synchronously.
        // TODO: .readFile can be used to support asynchronous behavior
        const fileContent = fs.readFileSync(filename, 'utf-8');
        const testCases = fileContent.trim().split('\n\n');
        // Adjacency list is represented as a map of node -> [list of nodes]
        let adjacencyList = new Map();
        try {
            for (const testCase of testCases) {
                const lines = testCase.split('\n');
                let isValidFile = true;
                for (const line of lines) {
                    if (isValidFile) {
                        if (line.startsWith('#') || line.trim().length === 0)
                            continue;
                        // In cases where the line is a number
                        const isValidFormat = /^[a-zA-Z]{1,20}:[a-zA-Z,]*$/.test(line);
                        if (!isValidFormat) {
                            console.error(`Invalid format in input: "${line}" in file: ${filename}`);
                            isValidFile = false;
                            continue;
                        }
                        const [task, dependencies] = line.split(':');
                        const dependencyList = dependencies.split(',').filter(Boolean);
                        adjacencyList.set(task, new Set(dependencyList));
                    }
                }
                if (isValidFile) {
                    const executionOrder = this.getExecutionOrder(adjacencyList);
                    if (executionOrder.length > 0) {
                        console.log(executionOrder.join(' '));
                    }
                }
                adjacencyList.clear();
            }
        }
        catch (e) {
            console.error('An error occured while parsing the file: ' + filename);
        }
    }
    getExecutionOrder(adjacencyList) {
        // Indegrees is tracked to know independent tasks and dependencies
        // Map of node name -> number of connected nodes
        const indegree = new Map();
        // Final output is tracked in executionOrder
        const executionOrder = [];
        // Calculate indegree for each task
        // This is useful in knowing disjoint graphs
        adjacencyList.forEach((dependencies) => {
            dependencies.forEach((dependency) => {
                indegree.set(dependency, (indegree.get(dependency) || 0) + 1);
            });
        });
        // Initialize queue with adjacencyList having indegree 0
        const queue = [];
        adjacencyList.forEach((_, task) => {
            if (!indegree.has(task)) {
                queue.push(task);
            }
        });
        // Process adjacencyList using BFS
        while (queue.length > 0) {
            const currentTask = queue.shift();
            executionOrder.push(currentTask);
            const dependents = adjacencyList.get(currentTask) || new Set();
            for (const dependent of dependents) {
                indegree.set(dependent, (indegree.get(dependent) || 1) - 1);
                if (indegree.get(dependent) === 0) {
                    queue.push(dependent);
                }
            }
        }
        // Check for cycles in the graph
        if (executionOrder.length !== adjacencyList.size) {
            console.error('Cycle detected in task dependencies or the input graph is incorrect');
            return [];
        }
        // Reverse the order to get the correct sequence
        return executionOrder.reverse();
    }
}
