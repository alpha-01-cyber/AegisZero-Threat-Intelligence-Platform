import { motion } from 'framer-motion';
import { Shield, Lock, Zap } from 'lucide-react';

export function LoadingScreen() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

            {/* Floating orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            />

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Main shield icon with orbiting elements */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="relative"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-2xl rounded-full scale-150" />

                    {/* Main shield */}
                    <motion.div
                        animate={{
                            rotateY: [0, 360],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="relative z-10 w-32 h-32 flex items-center justify-center"
                    >
                        <Shield className="w-24 h-24 text-primary drop-shadow-2xl" strokeWidth={1.5} />
                    </motion.div>

                    {/* Orbiting icons */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative w-40 h-40">
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Lock className="w-5 h-5 text-blue-400" />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="relative w-48 h-48">
                            <motion.div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <Zap className="w-5 h-5 text-purple-400" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Rotating rings */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 -m-6 border-2 border-transparent border-t-primary/40 border-r-primary/20 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 -m-10 border-2 border-transparent border-b-purple-500/30 border-l-blue-500/20 rounded-full"
                    />
                </motion.div>

                {/* Text content */}
                <div className="flex flex-col items-center gap-3">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
                    >
                        AegisZero
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-muted-foreground text-sm font-medium"
                    >
                        Initializing Threat Intelligence Platform
                    </motion.p>
                </div>

                {/* Enhanced loading bar */}
                <div className="w-72 h-1.5 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            repeatDelay: 0.2
                        }}
                        className="w-1/3 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                </div>

                {/* Pulse dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                            className="w-2 h-2 bg-primary rounded-full"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
