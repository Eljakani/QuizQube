// quizPrompts.ts

export type QuizType = 'multiple_choice' | 'true_false' | 'mixed';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizOptions {
  questionCount: number;
  difficulty: QuizDifficulty;
  content: string;
}

interface QuizQuestion {
  type: 'multiple_choice' | 'true_false';
  question: string;
  options: string[];
  correct: string;
}

interface QuizFormat {
  topic: string;
  questions: QuizQuestion[];
}

interface JSONExample {
  format: QuizFormat;
  example: QuizQuestion;
  examples?: QuizQuestion[];
}

// Template parts that will be composed based on quiz type
const COMMON_INSTRUCTIONS = [
  'Generate a comprehensive quiz based on the following content. Follow these guidelines strictly:',
  '',
  '1. Create EXACTLY %questionCount% questions. This is crucial.',
  '2. Difficulty level: %difficulty%',
  '3. Ensure questions are diverse and cover different aspects of the content. Each question should focus on a unique piece of information from the document.',
  '4. Use clear, concise language in questions and options.',
  '5. Avoid ambiguous or trick questions.',
  '6. Ensure the correct answer is accurate and based on the given content.',
  '7. Do not repeat or rephrase the same question multiple times.',
  '8. The topic of the quiz should be 1-4 words long and accurately represent the main theme of the content.'
].join('\n');

const COMMON_REMINDERS = [
  'Remember:',
  '1. Your entire response must be valid JSON. Do not include any explanations or additional text outside the JSON structure.',
  '2. Generate EXACTLY %questionCount% questions. This is a strict requirement.',
  '3. Ensure each question covers a different aspect of the content to maximize learning value.',
  '4. Double-check that your response adheres to all the guidelines before submitting.'
].join('\n');

const QUIZ_TYPE_SPECIFIC_INSTRUCTIONS: Record<QuizType, string> = {
  multiple_choice: [
    '9. All questions must be multiple-choice with exactly 4 options each.',
    '10. Make sure all options are plausible but only one is correct.',
    '11. Distribute correct answers evenly among options (A, B, C, D) to avoid patterns.'
  ].join('\n'),

  true_false: [
    '9. All questions must be statements that can be judged as either true or false.',
    '10. Each question must have exactly two options: ["True", "False"].',
    '11. Provide clear statements that can be definitively judged as true or false based on the content.',
    '12. Aim for a balanced mix of true and false statements.',
    '13. The correct answer must be either "True" or "False", matching exactly one of the options.'
  ].join('\n'),

  mixed: [
    '9. Create a mix of multiple-choice (70%) and true/false (30%) questions.',
    '10. For multiple-choice questions:',
    '   - Provide exactly 4 options for each question.',
    '   - Make sure all options are plausible but only one is correct.',
    '   - Distribute correct answers evenly among options (A, B, C, D) to avoid patterns.',
    '11. For true/false questions:',
    '   - Provide exactly two options: ["True", "False"].',
    '   - Provide clear statements that can be definitively judged as true or false based on the content.',
    '   - The correct answer must be either "True" or "False".',
    '12. Ensure a good balance between multiple-choice and true/false questions throughout the quiz.'
  ].join('\n')
};

const JSON_FORMAT_EXAMPLES: Record<QuizType, JSONExample> = {
  multiple_choice: {
    format: {
      topic: "Main topic of the quiz",
      questions: [{
        type: "multiple_choice",
        question: "Question text",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: "Correct option (exactly as in options)"
      }]
    },
    example: {
      type: "multiple_choice",
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: "Paris"
    }
  },
  true_false: {
    format: {
      topic: "Main topic of the quiz",
      questions: [{
        type: "true_false",
        question: "Statement to be judged as true or false",
        options: ["True", "False"],
        correct: "True or False"
      }]
    },
    example: {
      type: "true_false",
      question: "Paris is the capital of France.",
      options: ["True", "False"],
      correct: "True"
    }
  },
  mixed: {
    format: {
      topic: "Main topic of the quiz",
      questions: [
        {
          type: "multiple_choice",
          question: "Question text",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correct: "Correct option (exactly as in options)"
        },
        {
          type: "true_false",
          question: "Statement to be judged as true or false",
          options: ["True", "False"],
          correct: "True or False"
        }
      ]
    },
    example: {
      type: "multiple_choice",
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correct: "Paris"
    },
    examples: [
      {
        type: "multiple_choice",
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correct: "Paris"
      },
      {
        type: "true_false",
        question: "Paris is the capital of France.",
        options: ["True", "False"],
        correct: "True"
      }
    ]
  }
};

/**
 * Safely replaces template variables in a string
 * @param template The template string
 * @param params Object containing the parameter values
 * @returns The formatted string
 */
function replaceTemplateVars(template: string, params: Record<string, string | number>): string {
  return template.replace(/%(\w+)%/g, (match, key) => {
    const replacement = params[key];
    return replacement !== undefined ? String(replacement) : match;
  });
}

/**
 * Generates the JSON format section of the prompt
 * @param type The type of quiz
 * @returns Formatted JSON examples string
 */
function getJSONFormatSection(type: QuizType): string {
  const example = JSON_FORMAT_EXAMPLES[type];
  const formatStr = JSON.stringify(example.format, null, 2);
  
  if (type === 'mixed' && example.examples) {
    const examplesStr = example.examples.map((ex, i) => 
      `${i + 1}. ${ex.type === 'multiple_choice' ? 'Multiple-choice' : 'True/False'}:\n${JSON.stringify(ex, null, 2)}`
    ).join('\n\n');
    return `\nRespond with JSON in the following format:\n\n${formatStr}\n\nExamples:\n${examplesStr}`;
  }
  
  return `\nRespond with JSON in the following format:\n\n${formatStr}\n\nExample:\n${JSON.stringify(example.example, null, 2)}`;
}

/**
 * Gets the appropriate prompt for the specified quiz type and parameters
 * @param type The type of quiz to generate
 * @param options Parameters for the prompt template
 * @returns The formatted prompt string
 * @throws Error if required parameters are missing
 */
export function getQuizPrompt(type: QuizType, options: QuizOptions): string {
  const { questionCount, difficulty, content } = options;

  // Validate inputs
  if (!questionCount || !difficulty || !content) {
    throw new Error('Missing required parameters for quiz generation');
  }
  
  // Build the prompt sections
  const sections = [
    COMMON_INSTRUCTIONS,
    QUIZ_TYPE_SPECIFIC_INSTRUCTIONS[type],
    getJSONFormatSection(type),
    `\nContent for quiz generation:\n${content}\n`,
    COMMON_REMINDERS
  ];

  // Join all sections and replace template variables
  const template = sections.join('\n\n');
  return replaceTemplateVars(template, {
    questionCount,
    difficulty
  });
}