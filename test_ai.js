import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyD8m8U6OuOSIPLgoPqgttYwQEQJY9OCaB4";

const genAI = new GoogleGenerativeAI(API_KEY);

async function checkModels() {
  console.log("Checking available models...");
  try {
    const candidates = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.5",
      "gemini-ultra",
    ];

    for (const modelName of candidates) {
      try {
        console.log(`Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`SUCCESS: ${modelName} is working!`);
        return;
      } catch (e) {
        console.log(`FAILED: ${modelName}`);
        // Log less noise, just the error code/message start
        console.log("Error:", e.message.substring(0, 200));
      }
    }
  } catch (error) {
    console.error("Global Error:", error);
  }
}

checkModels();
