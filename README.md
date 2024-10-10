
# QuizQube

![QuizQube Featured Image](/public/quizqube_featured.png)

QuizQube is an AI-powered quiz platform that helps you learn and test your knowledge by generating quizzes from uploaded documents. This project was created as a side project to dive deeper into Next.js and explore interactions with Large Language Models (LLMs).


## Features

- Upload PDF documents (up to 3)
- Generate quizzes based on uploaded content
- Customize quiz settings (number of questions, difficulty, type of quiz)
- Interactive quiz-taking experience
- Results overview with correct answers
- User authentication
- Personalized settings

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building web applications
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [AWS S3](https://aws.amazon.com/s3/) - Cloud storage for uploaded documents
- [Lucide React](https://lucide.dev/) - Icon library

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser
6. Grab an API key from [Groq](https://console.groq.com/api-keys) and set it in the settings page


## Learning Outcomes

This project provided valuable experience in:

- Building a full-stack application with Next.js
- Working with external APIs and cloud services (AWS S3)
- Integrating and fine-tuning AI models for quiz generation
- Implementing user authentication and personalization
- Creating responsive and animated user interfaces

## Future Improvements

- Implement more advanced quiz generation algorithms
- Add support for more document types (e.g., DOCX, TXT)
- Enhance the quiz-taking experience with timed quizzes and leaderboards
- Implement social sharing features
- Optimize performance and implement caching strategies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

*Inspired by [ExploreCarriers](https://github.com/Nutlope/explorecareers)*