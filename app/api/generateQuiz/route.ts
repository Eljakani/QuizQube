import { NextRequest, NextResponse } from 'next/server';
import Groq from "groq-sdk";
import { parse as jsonParse } from 'json5';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface GenerateQuizRequest {
  content: string;
  questionCount: 5 | 10 | 20 | 30;
  difficulty: 'easy' | 'medium' | 'hard';
  typeOfQuiz: 'multiple_choice' | 'true_false' | 'mixed';
}

interface Question {
  question: string;
  options: string[];
  correct: string;
  type: 'multiple_choice' | 'true_false';
}

interface QuizData {
  topic: string;
  questions: Question[];
}

function sanitizeJSON(jsonString: string): string {
  const match = jsonString.match(/\{[\s\S]*\}/);
  return match ? match[0] : '{}';
}

function validateAndFixQuizData(data: any, expectedCount: number, typeOfQuiz: string): QuizData {
  const fixedData: QuizData = {
    topic: typeof data.topic === 'string' ? data.topic : 'Untitled Quiz',
    questions: [],
  };

  if (Array.isArray(data.questions)) {
    fixedData.questions = data.questions.filter((q: any) => {
      if (typeof q.question !== 'string' || !Array.isArray(q.options) || typeof q.correct !== 'string' || !['multiple_choice', 'true_false'].includes(q.type)) {
        return false;
      }
      q.options = q.options.filter((opt: any) => typeof opt === 'string');
      if (typeOfQuiz === 'multiple_choice' && q.type !== 'multiple_choice') return false;
      if (typeOfQuiz === 'true_false' && q.type !== 'true_false') return false;
      if (q.type === 'multiple_choice' && q.options.length !== 4) return false;
      if (q.type === 'true_false' && (q.options.length !== 2 || !q.options.every(opt => ['True', 'False'].includes(opt)))) return false;
      return true;
    });
  }

  if (fixedData.questions.length < expectedCount) {
    console.warn(`Not enough valid questions generated. Expected ${expectedCount}, got ${fixedData.questions.length}`);
  } else if (fixedData.questions.length > expectedCount) {
    fixedData.questions = fixedData.questions.slice(0, expectedCount);
  }

  return fixedData;
}

const getPrompt = (typeOfQuiz: string, questionCount: number, difficulty: string, content: string) => {
  const baseInstructions = `
Generate a comprehensive quiz based on the following content. Follow these guidelines strictly:

1. Create EXACTLY ${questionCount} questions. This is crucial.
2. Difficulty level: ${difficulty}
3. Ensure questions are diverse and cover different aspects of the content. Each question should focus on a unique piece of information from the document.
4. Use clear, concise language in questions and options.
5. Avoid ambiguous or trick questions.
6. Ensure the correct answer is accurate and based on the given content.
7. Do not repeat or rephrase the same question multiple times.
8. The topic of the quiz should be 1-4 words long and accurately represent the main theme of the content.`;

  const multipleChoicePrompt = `${baseInstructions}
9. All questions must be multiple-choice with exactly 4 options each.
10. Make sure all options are plausible but only one is correct.
11. Distribute correct answers evenly among options (A, B, C, D) to avoid patterns.

Respond with JSON in the following format:

{
  "topic": "Main topic of the quiz",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Correct option (exactly as in options)"
    }
  ]
}

Example:
{
  "type": "multiple_choice",
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correct": "Paris"
}`;

  const trueFalsePrompt = `${baseInstructions}
9. All questions must be statements that can be judged as either true or false.
10. Each question must have exactly two options: ["True", "False"].
11. Provide clear statements that can be definitively judged as true or false based on the content.
12. Aim for a balanced mix of true and false statements.
13. The correct answer must be either "True" or "False", matching exactly one of the options.

Respond with JSON in the following format:

{
  "topic": "Main topic of the quiz",
  "questions": [
    {
      "type": "true_false",
      "question": "Statement to be judged as true or false",
      "options": ["True", "False"],
      "correct": "True or False"
    }
  ]
}

Example:
{
  "type": "true_false",
  "question": "Paris is the capital of France.",
  "options": ["True", "False"],
  "correct": "True"
}`;

  const mixedPrompt = `${baseInstructions}
9. Create a mix of multiple-choice (70%) and true/false (30%) questions.
10. For multiple-choice questions:
   - Provide exactly 4 options for each question.
   - Make sure all options are plausible but only one is correct.
   - Distribute correct answers evenly among options (A, B, C, D) to avoid patterns.
11. For true/false questions:
   - Provide exactly two options: ["True", "False"].
   - Provide clear statements that can be definitively judged as true or false based on the content.
   - The correct answer must be either "True" or "False".
12. Ensure a good balance between multiple-choice and true/false questions throughout the quiz.

Respond with JSON in the following format:

{
  "topic": "Main topic of the quiz",
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": "Correct option (exactly as in options)"
    },
    {
      "type": "true_false",
      "question": "Statement to be judged as true or false",
      "options": ["True", "False"],
      "correct": "True or False"
    }
  ]
}

Examples:
1. Multiple-choice:
{
  "type": "multiple_choice",
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correct": "Paris"
}

2. True/False:
{
  "type": "true_false",
  "question": "Paris is the capital of France.",
  "options": ["True", "False"],
  "correct": "True"
}`;

  const selectedPrompt = typeOfQuiz === 'multiple_choice' ? multipleChoicePrompt :
                         typeOfQuiz === 'true_false' ? trueFalsePrompt : mixedPrompt;

  return `${selectedPrompt}

Content for quiz generation:
${content}

Remember:
1. Your entire response must be valid JSON. Do not include any explanations or additional text outside the JSON structure.
2. Generate EXACTLY ${questionCount} questions. This is a strict requirement.
3. Ensure each question covers a different aspect of the content to maximize learning value.
4. Double-check that your response adheres to all the guidelines before submitting.`;
};

export async function POST(request: NextRequest) {
  const { content, questionCount, difficulty, typeOfQuiz } = await request.json() as GenerateQuizRequest;

  try {
    const prompt = getPrompt(typeOfQuiz, questionCount, difficulty, content);

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz generator. Your responses must be in valid JSON format only, with no additional text. You must strictly adhere to the specified number of questions and quiz type.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const sanitizedJSON = sanitizeJSON(completion.choices[0].message.content || '{}');
    let quizData: any;

    try {
      quizData = jsonParse(sanitizedJSON);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      quizData = {};
    }

    const validatedQuizData = validateAndFixQuizData(quizData, questionCount, typeOfQuiz);

    if (validatedQuizData.questions.length !== questionCount) {
      throw new Error(`Invalid number of questions generated. Expected ${questionCount}, got ${validatedQuizData.questions.length}`);
    }

    return NextResponse.json(validatedQuizData, { status: 200 });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}