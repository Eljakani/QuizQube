import React from 'react';
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, Star, Trophy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useUserStats } from './UserStatsContext';

const HeaderCard: React.FC = () => {
  const { data: session } = useSession();
  const { stats } = useUserStats();

  return (
    <div className="mb-2 shadow-none border-0 overflow-hidden py-2">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
              <AvatarFallback>{session?.user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">
                Hi {session?.user?.name}
                <span className='animate-waving-hand'>
                  👋
                </span>
                </CardTitle>
              <CardDescription>Welcome back to QuizQube!</CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="bg-foreground hover:bg-background/80 text-background transition-all duration-300 ease-in-out"
            onClick={() => window.open('https://github.com/Eljakani/QuizQube', '_blank')}
          >
            <Star className="h-5 w-5 mr-1" />
            Star us on GitHub
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <StatItem 
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            label="Documents"
            value={stats.documentCount}
          />
          <StatItem 
            icon={<Brain className="h-6 w-6 text-primary" />}
            label="Quizzes Taken"
            value={stats.quizCount}
          />
          <StatItem 
            icon={<Trophy className="h-6 w-6 text-primary" />}
            label="Avg. Score"
            value={`${stats.averageScore}%`}
          />
        </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
  <Card className="p-4 bg-background/95 rounded-lg shadow-none">
    <div className="flex items-center space-x-4">
      <div className="p-2 bg-primary/10 rounded-full text-primary">
        {icon}
      </div>
      <div>
        <CardTitle className="text-lg text-primary">{value}</CardTitle>
        <CardDescription>{label}</CardDescription>
      </div>
    </div>
  </Card>
);

export default HeaderCard;