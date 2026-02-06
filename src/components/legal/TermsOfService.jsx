import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="container mx-auto p-8 text-slate-200">
            <h1 className="text-3xl font-bold mb-6 text-emerald-400">Terms of Service</h1>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                <p>By accessing or using our diet tracking services, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">2. User Accounts</h2>
                <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">3. Health Disclaimer</h2>
                <p>This service is for informational purposes only and is not medical advice. Always consult with a qualified healthcare provider before starting any diet or exercise program.</p>
            </section>

            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 underline">Back to Login</Link>
        </div>
    );
}
