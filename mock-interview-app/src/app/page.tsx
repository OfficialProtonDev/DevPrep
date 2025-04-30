import Link from "next/link";
import { BlobAnimations } from "@/components/animations/blob-animations";
import { MotionDiv } from "@/components/animations/motion-wrapper";

export const metadata = {
  title: "DevPrep | AI-Powered Mock Interview Platform",
  description: "Practice your coding interview skills with our AI-powered mock interview platform. Get realistic feedback and improve your performance."
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Add animation styles */}
      <BlobAnimations />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-background"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-primary/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container relative z-10 px-4 py-24 mx-auto md:px-6 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col space-y-6"
            >
              <div className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-primary/10 text-primary max-w-fit">
                <span className="relative flex w-2 h-2 mr-2">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-primary"></span>
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-primary"></span>
                </span>
                AI-Powered Interview Practice
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                Master Your <span className="text-primary">Coding Interviews</span> With Confidence
              </h1>
              
              <p className="max-w-[600px] text-lg text-muted-foreground">
                Practice with our AI interviewer that simulates real-world technical interviews, provides instant feedback, and helps you improve your problem-solving skills.
              </p>
              
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <MotionDiv
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/interview"
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium transition-all rounded-lg shadow-lg sm:w-auto bg-primary hover:bg-primary/90 text-white dark:text-black focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    Start Free Interview
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Link>
                </MotionDiv>
                
                <MotionDiv
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center w-full px-6 py-3 text-base font-medium transition-all border rounded-lg shadow-sm sm:w-auto bg-background border-input hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    Learn More
                  </Link>
                </MotionDiv>
              </div>
              
              <div className="flex items-center pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 dark:bg-muted"></div>
                  ))}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Join 2,000+ developers improving their interview skills</p>
                </div>
              </div>
            </MotionDiv>
            
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                <div className="relative">
                  <div className="relative p-4 bg-white/10 border border-border backdrop-blur-sm rounded-2xl shadow-xl">
                    <div className="p-2 bg-background/80 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="text-xs font-mono">Interview Session</div>
                      </div>
                      <div className="p-4 bg-muted rounded-lg font-mono text-sm">
                        <div className="mb-2 text-primary">{`// Mock Interview`}</div>
                        <div className="mb-1">{`function findTwoSum(array, target) {`}</div>
                        <div className="mb-1 pl-4">{`const map = new Map();`}</div>
                        <div className="mb-1 pl-4">{`for (let i = 0; i < array.length; i++) {`}</div>
                        <div className="mb-1 pl-8">{`const complement = target - array[i];`}</div>
                        <div className="mb-1 pl-8 text-primary">{`// Check if complement exists`}</div>
                        <div className="mb-1 pl-8">{`if (map.has(complement)) {`}</div>
                        <div className="mb-1 pl-12">{`return [map.get(complement), i];`}</div>
                        <div className="mb-1 pl-8">{`}`}</div>
                        <div className="mb-1 pl-8">{`map.set(array[i], i);`}</div>
                        <div className="mb-1 pl-4">{`}`}</div>
                        <div className="mb-1">{`}`}</div>
                        <div className="mt-4 text-muted-foreground">
                          <span className="text-primary">AI Interviewer:</span> Great approach! Can you explain the time complexity?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container px-4 mx-auto md:px-6">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Prepare Like a Pro
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              Our platform offers everything you need to ace your next technical interview
            </p>
          </MotionDiv>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <path d="m18 16 4-4-4-4" />
                    <path d="m6 8-4 4 4 4" />
                    <path d="m14.5 4-5 16" />
                  </svg>
                ),
                title: "Real LeetCode Problems",
                description: "Practice with actual industry-used LeetCode problems to prepare for real interviews."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                    <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
                  </svg>
                ),
                title: "AI Interviewer",
                description: "Interact with our AI interviewer that provides realistic feedback and guidance during your session."
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <path d="M2 12h20" />
                    <path d="M12 2v20" />
                    <path d="m4.93 4.93 14.14 14.14" />
                    <path d="m19.07 4.93-14.14 14.14" />
                  </svg>
                ),
                title: "Performance Report",
                description: "Receive a detailed performance report with insights on your strengths and areas for improvement."
              }
            ].map((feature, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="flex flex-col p-6 transition-all bg-background border rounded-xl shadow-sm hover:shadow-md border-border"
              >
                <div className="p-3 mb-4 rounded-lg bg-primary/10 text-primary w-fit">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto md:px-6">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              Get started in minutes and improve your interview skills
            </p>
          </MotionDiv>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Choose a Problem",
                description: "Select from our library of real-world coding interview questions."
              },
              {
                step: "02",
                title: "Start the Interview",
                description: "Begin your mock interview session with our AI interviewer."
              },
              {
                step: "03",
                title: "Solve & Explain",
                description: "Work through the problem while explaining your thought process."
              },
              {
                step: "04",
                title: "Get Feedback",
                description: "Receive detailed feedback and suggestions for improvement."
              }
            ].map((step, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col p-6 transition-all bg-background border rounded-xl shadow-sm hover:shadow-md border-border"
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="mt-6 mb-2 text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < 3 && (
                  <div className="absolute hidden md:block -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </div>
                )}
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary/5">
        <div className="container px-4 mx-auto md:px-6">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              What Our Users Say
            </h2>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
              Hear from developers who improved their interview performance
            </p>
          </MotionDiv>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: "DevPrep helped me land my dream job at Google. The AI interviewer gave me feedback that was spot on!",
                name: "Alex Johnson",
                title: "Software Engineer at Google"
              },
              {
                quote: "After practicing with DevPrep for just two weeks, I felt so much more confident in my actual interviews.",
                name: "Sarah Chen",
                title: "Frontend Developer at Meta"
              },
              {
                quote: "The realistic interview environment and detailed feedback reports helped me identify and fix my weaknesses.",
                name: "Michael Rodriguez",
                title: "Full Stack Developer at Amazon"
              }
            ].map((testimonial, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col p-6 transition-all bg-background border rounded-xl shadow-sm hover:shadow-md border-border"
              >
                <div className="mb-4 text-4xl text-primary">&ldquo;</div>
                <p className="mb-4 italic text-muted-foreground">{testimonial.quote}</p>
                <div className="mt-auto">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto md:px-6">
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground"
          >
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-primary mix-blend-multiply"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary to-transparent"></div>
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 px-6 py-12 text-center md:py-16 md:px-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="max-w-2xl mx-auto mt-4 text-lg text-primary-foreground/80">
                Start practicing today and gain the confidence you need to succeed
              </p>
              <MotionDiv
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8"
              >
                <Link
                  href="/interview"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium transition-all border-2 rounded-lg shadow-lg bg-background text-primary border-primary focus:outline-none focus:ring-2 focus:ring-white/50 dark:text-white dark:border-white"
                >
                  Start Free Interview
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </MotionDiv>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container px-4 mx-auto md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">DevPrep</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered mock interviews to help you ace your next coding interview.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link href="/docs" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t border-border md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DevPrep. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
