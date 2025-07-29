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
        You are a helpful code refactoring assistant. Provide clear, concise, and improved code.
        Refactor and improve this code snippet:
         ${codeSnippet} `;

    const result = await model.generateContent(prompt);

    const aiSuggestion = result.response.text();
    

    res.json({ suggestion: aiSuggestion });
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