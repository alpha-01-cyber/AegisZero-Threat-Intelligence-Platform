import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface CenteredLoadingProps {
    message?: string;
    className?: string;
}

export function CenteredLoading({ message = "Loading...", className = "" }: CenteredLoadingProps) {
    return (
        <div className={`flex flex-col items-center justify-center min-h-[400px] gap-4 ${className}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
                <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground font-medium"
            >
                {message}
            </motion.p>
        </div>
    );
}
