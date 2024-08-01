// import OpenAI from "openai";


// const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// if (!apiKey) {
//   console.error("Error: OPENAI_API_KEY environment variable is missing or empty.");
//   process.exit(1);
// }

// const openai = new OpenAI({ apiKey });

// async function main() {
//   try {
//     const completion = await openai.chat.completions.create({
//       messages: [{ role: "system", content: "You are a helpful assistant." }],
//       model: "gpt-4",
//     });

//     console.log(completion.choices[0]);
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

// main();
