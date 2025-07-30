import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post('/ask-ai',async (req,res)=>{
    const {codeSnippet} = req.body ;
    if(!codeSnippet){
        return res.status(400).json({error:'Please provide a code snippet.'});
    }
    try{
    const prompt = `
You are an expert code refactoring assistant. Analyze the following JavaScript/TypeScript code and return your suggestions in JSON format.

Your goal is to:
1. Simplify complex conditional statements (e.g., deeply nested if/else).
2. Improve variable and function naming for clarity.
3. Extract reusable logic into separate functions.
4. Suggest appropriate design patterns if applicable.

Please respond with a JSON array. Each object in the array must have:
- "type": (e.g., "Readability", "Complexity Reduction", "Design Pattern")
- "originalCodeSnippet"
- "refactoredCodeSnippet"
- "explanation"

Here is the code snippet:
\`\`\`javascript
${codeSnippet}
\`\`\`
`;

   const result = await model.generateContent(prompt);
  const rawResponse = await result.response.text();

  // Try parsing the JSON content (Gemini may add markdown formatting)
  const jsonStart = rawResponse.indexOf('[');
  const jsonEnd = rawResponse.lastIndexOf(']');
  const jsonText = rawResponse.slice(jsonStart, jsonEnd + 1);

  const suggestions = JSON.parse(jsonText);

  res.json({ suggestion: suggestions });
    }catch(error){
       
       res.status(500).json({ error: 'Failed to get AI suggestion.' });
    }
});
app.get('/',(req,res)=>{
     res.send('CodeSculptor Backend is running!');
})

const port = process.env.PORT || 3000 ;
app.listen(port,()=>{
     console.log(`Server is running at http://localhost:${port}`);
})