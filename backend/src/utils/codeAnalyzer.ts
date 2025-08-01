import * as parser from '@babel/parser';
import traverse from '@babel/traverse';


export function analyzeCodeStructure(code: string) {
  try {
    const ast = parser.parse(code, {
      sourceType: 'module', // Treat code as a module (with imports/exports)
      plugins: ['jsx', 'typescript'] // Support JSX and TypeScript syntax
    });

    let complexityScore = 0;
    let functionCount = 0;
    let deeplyNestedIf = 0;
    let loopCount = 0;
    let cyclomaticComplexity = 1; // Starts at 1 per function

    traverse(ast, {
      FunctionDeclaration(path) {
        functionCount++;
      },
      FunctionExpression(path) {
        functionCount++;
      },
      ArrowFunctionExpression(path) {
        functionCount++;
      },
      IfStatement(path) {
        let depth = 0;
        let currentPath: any = path;
        while (
          currentPath.parentPath &&
          (
            (typeof currentPath.parentPath.isIfStatement === 'function' && currentPath.parentPath.isIfStatement()) ||
            (typeof currentPath.parentPath.isBlockStatement === 'function' && currentPath.parentPath.isBlockStatement())
          )
        ) {
          depth++;
          currentPath = currentPath.parentPath;
        }
        if (
          depth >= 3 &&
          !(currentPath.parentPath &&
            typeof currentPath.parentPath.isIfStatement === 'function' &&
            currentPath.parentPath.isIfStatement())
        ) {
          deeplyNestedIf++;
        }
        cyclomaticComplexity++;
      },
      ForStatement(path) {
        loopCount++;
        cyclomaticComplexity++;
      },
      WhileStatement(path) {
        loopCount++;
        cyclomaticComplexity++;
      },
      DoWhileStatement(path) {
        loopCount++;
        cyclomaticComplexity++;
      },
      SwitchCase(path) {
        // Each case except 'default' increases complexity
        if (path.node.test) {
          cyclomaticComplexity++;
        }
      },
      ConditionalExpression(path) {
        cyclomaticComplexity++;
      },
      LogicalExpression(path) {
        // Each '&&' or '||' increases complexity
        if (path.node.operator === '&&' || path.node.operator === '||') {
          cyclomaticComplexity++;
        }
      }
    });

    complexityScore = functionCount * 5 + deeplyNestedIf * 10 + loopCount * 3 + cyclomaticComplexity * 2;

    return {
      linesOfCode: code.split('\n').length,
      functionCount,
      deeplyNestedIf,
      loopCount,
      cyclomaticComplexity,
      complexityScore,
      // We can add more detailed findings here
    };

  } catch (error) {
    console.error("Error parsing code:", error);
    return null;
  }
}