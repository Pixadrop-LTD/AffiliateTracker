import { motion } from "framer-motion";

const Logo = () => {
    return (
        <motion.div
            whileHover={{ scale: 1.02, rotate: [0, -5, 5, 0] }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center justify-center mb-4 size-20 rounded-3xl bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 shadow-xl shadow-primary-500/25"
        >
            <div className="size-16 rounded-2xl bg-linear-to-br from-white/20 to-white/5 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <h1 className="text-white text-3xl font-bold tracking-tight">AT</h1>
            </div>
        </motion.div>
    );
};

export default Logo;