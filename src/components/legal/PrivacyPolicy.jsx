import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto p-8 text-slate-200">
            <h1 className="text-3xl font-bold mb-6 text-emerald-400">Privacy Policy</h1>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, update your profile, or input daily diet entries. This includes your name, email, phone number, and health metrics (weight, height).</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, including tracking your diet progress and calculating BMI.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">3. Data Security</h2>
                <p>We implement reasonable security measures to protect your information, including encryption of passwords and secure session management via HttpOnly cookies.</p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">4. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@diettracker.com.</p>
            </section>

            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 underline">Back to Login</Link>
        </div>
    );
}
