import { motion } from 'framer-motion';

export default function BMIGauge({ bmi, category, color }) {
    // Gauge Range: 15 to 40
    const MIN_BMI = 15;
    const MAX_BMI = 40;
    const RANGE = MAX_BMI - MIN_BMI;

    // Clamp value
    const clampedBmi = Math.min(Math.max(bmi, MIN_BMI), MAX_BMI);

    // Convert BMI to Degrees (0 to 180)
    // 0 deg = left (15 BMI), 90 deg = top (27.5 BMI), 180 deg = right (40 BMI)
    const rotation = ((clampedBmi - MIN_BMI) / RANGE) * 180;

    return (
        <div style={{ position: 'relative', width: '100%', maxWidth: '200px', margin: '0 auto', textAlign: 'center' }}>
            <svg viewBox="0 0 200 110" style={{ width: '100%' }}>
                {/* Background Arc */}
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="15" strokeLinecap="round" />

                {/* Colored Segments (Simplified approximation) */}
                {/* Underweight */}
                <path d="M 20 100 A 80 80 0 0 1 50 48" fill="none" stroke="#3b82f6" strokeWidth="15" strokeOpacity="0.3" />
                {/* Normal */}
                <path d="M 50 48 A 80 80 0 0 1 110 28" fill="none" stroke="#10b981" strokeWidth="15" strokeOpacity="0.3" />
                {/* Overweight */}
                <path d="M 110 28 A 80 80 0 0 1 150 48" fill="none" stroke="#f59e0b" strokeWidth="15" strokeOpacity="0.3" />
                {/* Obese */}
                <path d="M 150 48 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="15" strokeOpacity="0.3" />

                {/* Needle */}
                <motion.g
                    initial={{ rotate: 0 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 60, damping: 15, delay: 0.2 }}
                    style={{ originX: "100px", originY: "100px" }}
                >
                    <line x1="100" y1="100" x2="20" y2="100" stroke={color} strokeWidth="4" strokeLinecap="round" />
                    <circle cx="100" cy="100" r="6" fill={color} />
                </motion.g>

                {/* Value Text centered */}
                <text x="100" y="85" textAnchor="middle" fontSize="24" fontWeight="bold" fill={color}>{bmi}</text>
                <text x="100" y="105" textAnchor="middle" fontSize="12" fill="#64748b">BMI</text>
            </svg>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ marginTop: '-10px', fontSize: '1rem', fontWeight: '600', color: color }}
            >
                {category}
            </motion.div>
        </div>
    );
}
