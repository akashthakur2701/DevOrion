import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { analyzeCodeStructure } from './utils/codeAnalyzer';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/ask-ai', async (req, res) => {
  const { codeSnippet } = req.body;
  console.log('Received codeSnippet:', codeSnippet);
  if (!codeSnippet) {
    return res.status(400).json({ error: 'Please provide a code snippet.' });
  }
  try {
    const codeInsights = analyzeCodeStructure(codeSnippet);
    console.log('Code insights:', codeInsights);
    let promptMessage = `Please analyze the following JavaScript/TypeScript function and provide refactoring suggestions for:
1. Simplifying complex conditional statements (e.g., deeply nested if/else).
2. Improving variable and function naming for clarity.
3. Extracting reusable logic into separate functions.
4. Suggesting appropriate design patterns if applicable.

`;

    if (codeInsights) {
      promptMessage += `\nHere are some structural insights about the code:
  - Lines of code: ${codeInsights.linesOfCode}
  - Number of functions: ${codeInsights.functionCount}
  - Deeply nested if statements (3+ levels): ${codeInsights.deeplyNestedIf}
  - Estimated complexity score: ${codeInsights.complexityScore}
  `;
      if (codeInsights.deeplyNestedIf > 0) {
        promptMessage += `\nSpecifically focus on reducing nesting in conditional logic.`;
      }
    }

    promptMessage += `\nProvide your output in a JSON array format, where each object has 'type' (e.g., 'Readability', 'Complexity Reduction', 'Design Pattern'), 'originalCodeSnippet', 'refactoredCodeSnippet', and 'explanation'.

Here is the code snippet:
\`\`\`javascript
${codeSnippet}
\`\`\`
`;

    const result = await model.generateContent(promptMessage);
    const rawResponse = await result.response.text();
    console.log('Raw AI response:', rawResponse);

    // Try parsing the JSON content (Gemini may add markdown formatting)
    const jsonStart = rawResponse.indexOf('[');
    const jsonEnd = rawResponse.lastIndexOf(']');
    const jsonText = rawResponse.slice(jsonStart, jsonEnd + 1);

    const suggestions = JSON.parse(jsonText);

    res.json({ suggestion: suggestions });
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ error: 'Failed to get AI suggestion.' });
  }
});
app.get('/', (req, res) => {
  res.send('CodeSculptor Backend is running!');
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
})