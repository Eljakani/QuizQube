'use client';
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Box, Loader } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import FileUploader from './FileUploader'
import { useToast } from "@/hooks/use-toast"
import { useUserStats } from './UserStatsContext'
import HeaderCard from './HeaderCard'
import { useFileUpload } from './FileUploadContext'
import { useQuizSettings } from './settings/settingsStorage'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from 'next/link'

interface Question {
  question: string;
  options: string[];
  correct: string;
  type: 'multiple_choice' | 'true_false';
}

const fadeInOut = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
}

const slideInOut = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
}

export default function QuizDashboard() {
  const { files, clearFiles } = useFileUpload();
  const [questionCount, setQuestionCount] = useState("5")
  const [difficulty, setDifficulty] = useState("medium")
  const [typeofQuiz, setTypeOfQuiz] = useState("mixed")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [quizState, setQuizState] = useState<'upload' | 'parsing' | 'generating' | 'quiz' | 'results'>('upload')
  const [score, setScore] = useState(0)
  const [quizTopic, setQuizTopic] = useState("")
  const [isUploading] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])

  const { toast } = useToast()
  const { handleQuizCompletion, handleDocumentUpload } = useUserStats();
  const { settings } = useQuizSettings();
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('quizSettings')
    if (storedSettings) {
      const { defaultQuestions, difficulty } = JSON.parse(storedSettings)
      setQuestionCount(defaultQuestions == "" ? "5" : defaultQuestions)
      setDifficulty(difficulty)
    }
  }, [])

  const handleUploadComplete = () => {
    handleDocumentUpload();
  }

  const handleGenerateQuiz = async () => {
    if (!settings?.groqApiKey) {
      setShowApiKeyDialog(true);
      return;
    }

    setQuizState('parsing')
    
    // Parse PDFs
    const parsedContents = await Promise.all(files.map(async (file) => {
      const response = await fetch('/api/parsePdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: file.url })
      })
      if (!response.ok) {
        throw new Error(`Failed to parse PDF: ${file.name}`)
      }
      const result = await response.json()
      return result.content
    }))

    setQuizState('generating')

    try {
      // Generate quiz
      const response = await fetch('/api/generateQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: settings?.groqApiKey,
          content: parsedContents.join('\n'),
          questionCount: parseInt(questionCount),
          difficulty,
          typeOfQuiz: typeofQuiz
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const generatedQuiz = await response.json()
      setQuestions(generatedQuiz.questions)
      setQuizTopic(generatedQuiz.topic)
      setQuizState('quiz')
    } catch (error) {
      console.error('Error generating quiz:', error)
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
      setQuizState('upload')
    }
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
    handleQuizCompletion(newScore, questions.length);
  }

  const isQuizComplete = answers.length === questions.length && answers.every(answer => answer !== undefined)

  return (
    <div className="h-full bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="container mx-auto px-4">
        <HeaderCard />
        {!settings?.groqApiKey && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Groq API Key Missing</AlertTitle>
            <AlertDescription>
              Please set up your Groq API key in the <Link href="/home/settings" className="font-medium underline">settings</Link> to start generating quizzes.
            </AlertDescription>
          </Alert>
        )}
        {settings?.groqApiKey && (
          <Alert variant="default" className="mb-4 bg-green-100 text-green-800 border-green-300">
            <AlertTitle>Groq API Key Set</AlertTitle>
            <AlertDescription>
              Your Groq API key is configured. You&apos;re ready to generate quizzes!
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-1 bg-card/50 shadow-none border-primary/10">
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload up to 3 PDF documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploader 
                onUploadComplete={handleUploadComplete}
              />
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
              <div className="w-full">
                <Label htmlFor="type">Type of Quiz</Label>
                <Select 
                  value={typeofQuiz}
                  onValueChange={setTypeOfQuiz}
                  disabled={quizState !== 'upload'}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type of Quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice Only</SelectItem>
                    <SelectItem value="true_false">True/False Only</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleGenerateQuiz} 
                disabled={files.length === 0 || quizState !== 'upload' || isUploading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Generate Quiz
              </Button>
            </CardFooter>
          </Card>
          <Card className="md:col-span-2 bg-card/50 shadow-none border-primary/10">
            <CardContent className="p-6">
              <AnimatePresence mode="wait">
                {quizState === 'upload' && (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center h-full min-h-[400px] h-full"
                  >
                    <div className="text-center flex flex-col items-center space-y-4 h-full">
                      <Box className="h-24 w-24 text-primary mb-4" />
                      <h2 className="text-2xl font-semibold mb-2">Ready to Generate Your Quiz</h2>
                      <p className="text-muted-foreground">
                        Upload your documents and set the number of questions, then click &quot;Generate Quiz&quot; to start.
                      </p>
                    </div>
                  </motion.div>
                )}
                {(quizState === 'parsing' || quizState === 'generating') && (
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
                    <p className="mt-4 text-lg">
                      {quizState === 'parsing' ? 'Parsing your documents...' : 'Generating your quiz...'}
                    </p>
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
                          <Card className="bg-card shadow-none border-primary/10">
                            <CardHeader>
                              <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="mb-4 text-lg">{questions[currentQuestion].question}</p>
                              <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswerChange}>
                                {questions[currentQuestion].type === 'multiple_choice' ? (
                                  questions[currentQuestion].options.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                      <RadioGroupItem value={option} id={`option-${index}`} />
                                      <Label htmlFor={`option-${index}`} className="text-base">{option}</Label>
                                    </div>
                                  ))
                                ) : (
                                  <>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <RadioGroupItem value="True" id="option-true" />
                                      <Label htmlFor="option-true" className="text-base">True</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 mb-2">
                                      <RadioGroupItem value="False" id="option-false" />
                                      <Label htmlFor="option-false" className="text-base">False</Label>
                                    </div>
                                  </>
                                )}
                              </RadioGroup>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </AnimatePresence>
                      <div className="flex justify-between">
                        <Button 
                          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                          disabled={currentQuestion === 0}
                          variant="outline"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        <Button 
                          onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                          disabled={currentQuestion === questions.length - 1}
                          variant="outline"
                        >
                          Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
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
                        <p className="text-muted-foreground">Here&apos;s how you performed</p>
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
                            <Card className="flex flex-col h-full bg-card">
                              <CardHeader>
                                <CardTitle className="text-base">Question {index + 1}</CardTitle>
                              </CardHeader>
                              <CardContent className="flex-grow">
                                <p className="mb-2 font-medium">{q.question}</p>
                                <p className="text-sm">Your answer: <span className={answers[index] === q.correct ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{answers[index]}</span></p>
                                <p className="text-sm">Correct answer: <span className="text-green-600 font-semibold">{q.correct}</span></p>
                                <p className="text-sm mt-2">Question Type: <span className="font-semibold">{q.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'}</span></p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                      <Button 
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                        onClick={() => {
                          setQuizState('upload')
                          clearFiles()
                          setAnswers([])
                          setCurrentQuestion(0)
                          setScore(0)
                          setQuizTopic("")
                          setQuestions([])
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
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Groq API Key Required</DialogTitle>
            <DialogDescription>
              To generate quizzes, you need to set up your Groq API key. This key is stored securely in your browser and is not sent to our servers.
              <br /><br />
              Please go to the <Link href="/home/settings" className="text-primary hover:underline">settings page</Link> to enter your Groq API key.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => {
            setShowApiKeyDialog(false);
            // You can add navigation to settings page here if needed
          }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}