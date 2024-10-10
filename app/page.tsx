'use client';
import HomeCard from "@/components/card";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTransitionRouter } from 'next-view-transitions'
import Image from "next/image";


const PdfIcon = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.1667 74.9992V64.5826M29.1667 64.5826V58.3326C29.1667 56.3701 29.1667 55.3867 29.8083 54.7742C30.45 54.1659 31.4792 54.1659 33.5417 54.1659H36.4583C39.4792 54.1659 41.9292 56.4992 41.9292 59.3742C41.9292 62.2492 39.4792 64.5826 36.4583 64.5826H29.1667ZM87.5 54.1659H82.0333C78.5958 54.1659 76.875 54.1659 75.8083 55.1826C74.7417 56.1992 74.7417 57.8367 74.7417 61.1117V64.5826M74.7417 64.5826V74.9992M74.7417 64.5826H83.8542M65.625 64.5826C65.625 70.3326 60.7292 74.9992 54.6875 74.9992C53.325 74.9992 52.6458 74.9992 52.1333 74.7201C50.9208 74.0534 51.0417 72.6992 51.0417 71.5284V57.6367C51.0417 56.4659 50.9167 55.1117 52.1333 54.4451C52.6417 54.1659 53.325 54.1659 54.6875 54.1659C60.7292 54.1659 65.625 58.8326 65.625 64.5826Z" stroke="#FF6C5F" stroke-width="6.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M62.5 91.6659H44.6958C31.1125 91.6659 24.3125 91.6659 19.5958 88.3409C18.2535 87.3996 17.0537 86.2699 16.0333 84.9867C12.5 80.5451 12.5 74.1534 12.5 61.3617V50.7576C12.5 38.4117 12.5 32.2367 14.4542 27.3076C17.5958 19.3784 24.2375 13.1284 32.6625 10.1701C37.8958 8.33256 44.45 8.33256 57.575 8.33256C65.0667 8.33256 68.8167 8.33256 71.8083 9.38256C76.6208 11.0742 80.4167 14.6451 82.2125 19.1742C83.3333 21.9909 83.3333 25.5201 83.3333 32.5742V41.6659" stroke="#FF6C5F" stroke-width="6.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.5 49.9992C12.5 46.316 13.9631 42.7837 16.5676 40.1793C19.172 37.5749 22.7043 36.1117 26.3875 36.1117C29.1625 36.1117 32.4333 36.5951 35.1292 35.8742C36.3071 35.5572 37.381 34.9361 38.2432 34.0732C39.1054 33.2102 39.7257 32.1358 40.0417 30.9576C40.7625 28.2617 40.2792 24.9909 40.2792 22.2159C40.2803 18.5334 41.7439 15.0021 44.3482 12.3986C46.9525 9.79513 50.4842 8.33256 54.1667 8.33256" stroke="#FF6C5F" stroke-width="6.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const AiIcon = () => (
<svg width="101" height="101" viewBox="0 0 101 101" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.8333 69.4367C16.8333 72.7851 18.1635 75.9963 20.5311 78.3639C22.8988 80.7316 26.11 82.0617 29.4583 82.0617C29.4583 84.852 30.5668 87.528 32.5398 89.5011C34.5129 91.4741 37.1889 92.5826 39.9792 92.5826C42.7695 92.5826 45.4455 91.4741 47.4185 89.5011C49.3916 87.528 50.5 84.852 50.5 82.0617C50.5 84.852 51.6084 87.528 53.5815 89.5011C55.5545 91.4741 58.2305 92.5826 61.0208 92.5826C63.8111 92.5826 66.4872 91.4741 68.4602 89.5011C70.4332 87.528 71.5417 84.852 71.5417 82.0617C73.7799 82.0619 75.9779 81.4671 77.9106 80.3382C79.8432 79.2092 81.441 77.5868 82.5402 75.6372C83.6395 73.6875 84.2006 71.4806 84.1662 69.2427C84.1318 67.0047 83.5031 64.8162 82.3445 62.9012C85.2249 62.3446 87.8217 60.8026 89.6891 58.5399C91.5564 56.2772 92.5777 53.435 92.5777 50.5013C92.5777 47.5676 91.5564 44.7254 89.6891 42.4627C87.8217 40.2 85.2249 38.658 82.3445 38.1015C83.5042 36.1864 84.1338 33.9974 84.1687 31.7588C84.2037 29.5203 83.6427 27.3127 82.5434 25.3623C81.444 23.412 79.8458 21.7891 77.9125 20.6599C75.9793 19.5308 73.7805 18.9361 71.5417 18.9367C71.5417 16.1464 70.4332 13.4704 68.4602 11.4974C66.4872 9.52433 63.8111 8.41589 61.0208 8.41589C58.2305 8.41589 55.5545 9.52433 53.5815 11.4974C51.6084 13.4704 50.5 16.1464 50.5 18.9367C50.5 16.1464 49.3916 13.4704 47.4185 11.4974C45.4455 9.52433 42.7695 8.41589 39.9792 8.41589C37.1889 8.41589 34.5129 9.52433 32.5398 11.4974C30.5668 13.4704 29.4583 16.1464 29.4583 18.9367C27.2201 18.9365 25.0221 19.5314 23.0894 20.6603C21.1568 21.7892 19.559 23.4116 18.4598 25.3613C17.3605 27.311 16.7994 29.5178 16.8338 31.7558C16.8682 33.9937 17.4969 36.1823 18.6555 38.0973C15.7751 38.6538 13.1783 40.1958 11.311 42.4585C9.44362 44.7212 8.42227 47.5634 8.42227 50.4971C8.42227 53.4308 9.44362 56.273 11.311 58.5357C13.1783 60.7984 15.7751 62.3404 18.6555 62.897C17.4624 64.8696 16.8322 67.1313 16.8333 69.4367Z" stroke="#FF6C5F" stroke-width="6.3125" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M31.5625 61.0201L39.3143 37.7648C39.5088 37.1845 39.8808 36.6799 40.3777 36.3224C40.8746 35.965 41.4712 35.7727 42.0833 35.7727C42.6954 35.7727 43.2921 35.965 43.7889 36.3224C44.2858 36.6799 44.6578 37.1845 44.8524 37.7648L52.6042 61.0201M65.2292 35.7701V61.0201M35.7708 52.6034H48.3958" stroke="#FF6C5F" stroke-width="6.3125" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const TestIcon = () => (
<svg width="101" height="102" viewBox="0 0 101 102" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.4882 86.0996C13.2436 92.8919 33.915 98.228 43.6783 85.5105C54.2412 90.5605 71.6637 88.995 85.8458 81.0833C87.8153 79.9849 89.6838 78.5962 90.8243 76.6477C93.404 72.25 93.4671 66.1479 88.7622 57.1463C80.9136 37.5565 66.8031 20.3654 61.105 13.4512C59.9351 12.3822 52.4695 10.8672 47.9203 9.41115C45.9087 8.79253 42.1675 8.3759 37.6898 14.276C35.5646 17.0745 25.9233 23.9425 38.157 28.5633C40.0507 29.0472 41.4479 29.9352 50.0918 28.3529C51.2196 28.1593 54.0308 28.3529 56.0129 31.8332L60.1497 37.7501C60.5385 38.2982 60.7844 38.9346 60.8651 39.6017C61.589 45.9142 61.5637 53.8091 65.0819 57.807C59.6489 53.8806 45.4542 49.2136 34.7566 62.4909M8.42087 55.1052C13.2361 50.8123 19.3754 48.2964 25.8185 47.9756C32.2615 47.6548 38.6204 49.5485 43.8382 53.3419" stroke="#FF6C5F" stroke-width="6.3125" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

export default function Home() {
  const { data: session } = useSession();
  const cards = [
    {
      step: 1,
      title: "Provide the knowledge",
      content: "Upload your study materials or input your knowledge base into the system. This can include textbooks, notes, articles, or any other relevant learning resources you want to master.",
      icon: <PdfIcon />
    },
    {
      step: 2,
      title: "QuizQube does the Magic",
      content: "Our AI-powered system analyzes and processes your information, understanding key concepts and relationships. It then generates tailored quizzes and study aids specific to your content.",
      icon: <AiIcon />
    },
    {
      step: 3,
      title: "Get Ready to Test Your Knowledge",
      content: "Access your personalized quizzes and learning resources. Start testing yourself on the material you provided, track your progress over time, and identify areas where you need to focus.",
      icon: <TestIcon />
    }
  ];
  const router = useTransitionRouter()
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  const goHome = () => {
    router.push("/home")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-black">
      <main className="p-8 max-w-5xl w-full">
        <motion.h1 
          className="text-5xl font-bold text-center mb-4 flex items-center justify-center text-[#333333]"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ duration: 0.5 }}
        >
          <Image src="/quizqube.svg" alt="QuizQube" width={100} height={100} className="inline-block w-20 h-20 mr-2" />
          QuizQube
        </motion.h1>
        <motion.p 
          className="text-2xl md:text-4xl text-center mb-8 font-light anti-aliased text-balance"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          QuizQube is an AI-powered quiz platform that helps you learn and test your knowledge.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {cards.slice(0, 2).map((card, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariants}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
            >
              <HomeCard step={card.step} title={card.title} content={card.content} icon={card.icon} />
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex justify-center mb-8"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="md:w-1/2">
            <HomeCard 
              step={cards[2].step} 
              title={cards[2].title} 
              content={cards[2].content} 
              icon={cards[2].icon} 
            />
          </div>
        </motion.div>

        <motion.div 
          className="text-center mt-8 w-full flex justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeUpVariants}
          transition={{ duration: 0.5, delay: 1 }}
        >
         <button 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 flex items-center justify-center space-x-2"
            onClick={() => session ? goHome() : signIn("github",{ redirectTo: "/home" })}
          >
            {session ? (
              <>
              <Avatar className="w-6 h-6">
                <AvatarImage src={session.user?.image || "#"} alt="User Avatar" />
                <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span>Go to Dashboard</span>
              </>
            ) : (
              <span>Get Started</span>
            )}
          </button>
        </motion.div>
      </main>

      <motion.footer 
        className="mt-8 text-center text-sm text-black font-light md:absolute bottom-6 border rounded-full py-2 px-6 z-10"
        initial="hidden"
        animate="visible"
        variants={fadeUpVariants}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        Built with <span className="inline-block hover:scale-125 hover:rotate-12 transition-transform duration-300 ease-in-out cursor-default">❤️</span> by <a href="https://eljakani.me" className="font-semibold hover:underline cursor-pointer">Eljakani</a> using <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-main hover:underline cursor-pointer">Groq</a> & <a href="https://ai.meta.com/llama/" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0079C1] hover:underline cursor-pointer">Llama3.1</a>
      </motion.footer>
    </div>
  );
}