"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, ChevronRight, ChevronLeft, Loader2, X, BrainCircuit, BoxIcon, Box, Loader } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from 'next-auth/react'

const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
}

const slideInOut = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5 }
}

export default function QuizDashboard() {
  const [files, setFiles] = useState<File[]>([])
  const [questionCount, setQuestionCount] = useState("5")
  const [difficulty, setDifficulty] = useState("medium")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [quizState, setQuizState] = useState<'upload' | 'generating' | 'quiz' | 'results'>('upload')
  const [score, setScore] = useState(0)
  const [quizTopic, setQuizTopic] = useState("")

  useEffect(() => {
    const storedSettings = localStorage.getItem('quizSettings');
    if (storedSettings) {
      const { defaultQuestions, difficulty } = JSON.parse(storedSettings);
      setQuestionCount(defaultQuestions);
      setDifficulty(difficulty);
    }
  }, []);

  // Mock questions for demonstration
  const questions = [
    { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: "Paris" },
    { question: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"], correct: "William Shakespeare" },
    { question: "What is the largest planet in our solar system?", options: ["Mars", "Jupiter", "Saturn", "Neptune"], correct: "Jupiter" },
    { question: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Fe", "Cu"], correct: "Au" },
    { question: "Which country is known as the Land of the Rising Sun?", options: ["China", "Korea", "Japan", "Thailand"], correct: "Japan" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length + files.length <= 5) {
      setFiles([...files, ...selectedFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleGenerateQuiz = async () => {
    setQuizState('generating')
    // Simulate API call to generate quiz and detect topic
    await new Promise(resolve => setTimeout(resolve, 3000))
    setQuizTopic("General Knowledge") // This would be set by the actual API response
    setQuizState('quiz')
  }

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = value
    setAnswers(newAnswers)
  }

  const handleSubmitQuiz = () => {
    const newScore = answers.reduce((acc, answer, index) => {
      return answer === questions[index].correct ? acc + 1 : acc
    }, 0)
    setScore(newScore)
    setQuizState('results')
  }

  const isQuizComplete = answers.length === questions.length && answers.every(answer => answer !== undefined)

  const { data: session } = useSession();
    if (!session) {
        return <div className="min-h-screen flex items-center justify-center bg-background">Please sign in to access this page</div>
    }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">Hi {session?.user?.name} 👋</CardTitle>
              <CardDescription>Generate quizzes from your documents</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload up to 5 PDF documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="document">Upload PDFs (Max 5)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="document" 
                    type="file" 
                    accept=".pdf" 
                    multiple 
                    onChange={handleFileChange} 
                    className="file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    disabled={quizState !== 'upload' || files.length >= 5}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload PDF files</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <ScrollArea className="h-[250px] border rounded-md p-4">
                <AnimatePresence>
                  {files.map((file, index) => (
                    <motion.div
                      key={file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-3 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveFile(index)}
                            disabled={quizState !== 'upload'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="w-full">
                <Label htmlFor="questionCount">Number of Questions</Label>
                <Select 
                  value={questionCount} 
                  onValueChange={setQuestionCount}
                  disabled={quizState !== 'upload'}
                >
                  <SelectTrigger id="questionCount">
                    <SelectValue placeholder="Select question count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                    <SelectItem value="30">30 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={difficulty} 
                onValueChange={setDifficulty}
                disabled={quizState !== 'upload'}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
              <Button 
                onClick={handleGenerateQuiz} 
                disabled={files.length === 0 || quizState !== 'upload'}
                className="w-full"
              >
                Generate Quiz
              </Button>
            </CardFooter>
          </Card>
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {quizState === 'upload' && (
                  <motion.div
                    key="placeholder"
                    {...fadeInOut}
                    className="flex flex-col items-center justify-center h-full min-h-[400px]"
                  >
                    <div className="text-center flex flex-col items-center space-y-4">
                      <Box className="h-24 w-24 text-primary mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">Ready to Generate Your Quiz</h2>
                      <p className="text-muted-foreground">
                        Upload your documents and set the number of questions, then click "Generate Quiz" to start.
                      </p>
                    </div>
                  </motion.div>
                )}
                {quizState === 'generating' && (
                  <motion.div
                    key="generating"
                    {...fadeInOut}
                    className="flex flex-col items-center justify-center h-full min-h-[400px]"
                  >
                    <motion.div
                      animate={{
                        rotate: 360,
                        transition: { duration: 2, repeat: Infinity, ease: "linear" }
                      }}
                    >
                      <Loader className="h-16 w-16 text-primary" />
                    </motion.div>
                    <p className="mt-4 text-lg">Generating your quiz...</p>
                  </motion.div>
                )}
                {quizState === 'quiz' && (
                  <motion.div
                    key="quiz"
                    {...slideInOut}
                  >
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Quiz: {quizTopic}</h2>
                        <p className="text-muted-foreground">Answer all questions to complete the quiz</p>
                      </div>
                      <Progress value={(currentQuestion + 1) / questions.length * 100} className="w-full" />
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentQuestion}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="mb-4 text-lg">{questions[currentQuestion].question}</p>
                              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange}>
                                {questions[currentQuestion].options.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2 mb-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="text-base">{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </AnimatePresence>
                      <div className="flex justify-between">
                        <Button 
                          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestion === 0}
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button 
                          onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                          disabled={currentQuestion === questions.length - 1}
                        >
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        className="w-full" 
                        disabled={!isQuizComplete}
                        onClick={handleSubmitQuiz}
                      >
                        Submit Quiz
                      </Button>
                    </div>
                  </motion.div>
                )}
                {quizState === 'results' && (
                  <motion.div
                    key="results"
                    {...slideInOut}
                  >
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Quiz Results: {quizTopic}</h2>
                        <p className="text-muted-foreground">Here's how you performed</p>
                      </div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-center mb-6"
                      >
                        <p className="text-5xl font-bold mb-4">{score} / {questions.length}</p>
                        <p className="text-xl">
                          {score === questions.length ? "Perfect score!" : 
                           score >= questions.length / 2 ? "Good job!" : 
                           "Keep practicing!"}
                        </p>
                      </motion.div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {questions.map((q, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Card className="flex flex-col h-full">
                              <CardHeader>
                                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                              </CardHeader>
                              <CardContent className="flex-grow">
                                <p className="mb-2 font-medium">{q.question}</p>
                                <p className="text-sm">Your answer: <span className={answers[index] === q.correct ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{answers[index]}</span></p>
                                <p className="text-sm">Correct answer: <span className="text-green-600 font-semibold">{q.correct}</span></p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setQuizState('upload')
                          setFiles([])
                          setAnswers([])
                          setCurrentQuestion(0)
                          setScore(0)
                          setQuizTopic("")
                        }}
                      >
                        Start New Quiz
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}