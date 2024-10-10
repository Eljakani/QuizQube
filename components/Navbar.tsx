'use client';

import React from 'react';
import { Menu, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Link, useTransitionRouter } from 'next-view-transitions'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const Navbar: React.FC = () => {
    const { data: session } = useSession();
    const router = useTransitionRouter()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center mx-auto">
                <div className="mr-4 hidden md:flex">
                    <Link href="/home" className="mr-6 flex items-center space-x-1 font-bold">
                        <Image src="/quizqube.svg" alt="QuizQube" width={100} height={100} className="inline-block w-9 h-9" />
                        <span className="hidden font-bold sm:inline-block">QuizQube</span>
                    </Link>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 md:hidden"
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <Link href="/home" className="flex items-center">
                            <span className="font-bold">QuizQube</span>
                        </Link>
                    </SheetContent>
                </Sheet>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <Badge variant="outline" className="hidden md:inline-flex">Beta: Outputs may have errors</Badge>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                                    <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/home/settings')}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Navbar;