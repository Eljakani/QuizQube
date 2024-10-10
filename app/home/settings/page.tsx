'use client';

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { useQuizSettings } from './settingsStorage'
import { Skeleton } from "@/components/ui/skeleton" 
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export default function Settings() {
    const { data: session } = useSession()
    const { settings, updateSetting } = useQuizSettings();

    if (!settings) {
      return (
        <div className="flex w-full flex-col">
          <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
            <div className="mx-auto grid w-full max-w-6xl gap-2">
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
              <Skeleton className="h-40 w-full" />
              <div className="grid gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </main>
        </div>
      );
    }

    return (
      <div className="flex w-full flex-col">
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-background p-4 md:gap-8 md:p-10">
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">QuizQube Settings</h1>
          </div>
          <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
            <nav className="grid gap-4 text-sm text-muted-foreground">
              <Link href="#" className="font-semibold text-primary">
                General
              </Link>
            </nav>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                      <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-lg font-semibold">{session?.user?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-lg font-semibold">{session?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Generation Settings</CardTitle>
                  <CardDescription>
                    Customize your quiz generation preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="default-questions">Default Number of Questions</Label>
                      <Select
                        value={settings.defaultQuestions}
                        onValueChange={(value) => updateSetting('defaultQuestions', value)}
                      >
                        <SelectTrigger id="default-questions">
                          <SelectValue placeholder="Select default question count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                          <SelectItem value="30">30 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="difficulty">Default Difficulty Level</Label>
                      <Select
                        value={settings.difficulty}
                        onValueChange={(value) => updateSetting('difficulty', value)}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select default difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="groq-api-key">Groq API Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="groq-api-key"
                          type="password"
                          value={settings.groqApiKey}
                          onChange={(e) => updateSetting('groqApiKey', e.target.value)}
                          placeholder="Enter your Groq API key"
                        />
                        <Button 
                          onClick={() => updateSetting('groqApiKey', '')}
                          variant="outline"
                        >
                          Clear
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        The Groq API key is required to generate quizzes using Groq&apos;s AI models. 
                        To obtain a key, sign up at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com</a>. 
                        Your key is kept secure and used only for quiz generation.
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
}