
import { useState } from "react";

function App() {
  const [codeSnippet, setCodeSnippet] = useState<string>(''); 
  const [aiSuggestion, setAiSuggestion] = useState<string>('Your smart suggestions will show up here after the AI thinks!'); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const handleAnalyzeCode = async () => {
    setIsLoading(true); 
    setAiSuggestion('Thinking hard...'); 

    try {
      
      const response = await fetch('http://localhost:3000/ask-ai', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codeSnippet: codeSnippet }), 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); 
      setAiSuggestion(data.suggestion);

    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
      setAiSuggestion('Oops! Something went wrong. Please try again.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">CodeSculptor: Your Smart Code Helper</h1>

      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-3">Paste Your Messy Code Here:</h2>
        <textarea
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 font-mono"
          placeholder="function messyCode() { console.log('I need help!'); }"
          value={codeSnippet} 
          onChange={(e) => setCodeSnippet(e.target.value)} 
        ></textarea>
        <button
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed" // <--- Added disabled styles
          onClick={handleAnalyzeCode} 
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Make My Code Smart!'} 
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">AI's Smart Suggestions:</h2>
        <div className="bg-gray-50 p-3 rounded-md border border-gray-200 h-40 overflow-auto text-gray-700 font-mono whitespace-pre-wrap"> {/* <--- Added whitespace-pre-wrap for AI output */}
          {aiSuggestion} 
        </div>
      </div>
    </div>
  );
}

export default App
