export default function Layout({ children }) {
    return (
        <>
            <div className="ambient-orb orb-1" />
            <div className="ambient-orb orb-2" />
            <div className="ambient-orb orb-3" />

            <div className="container">
                <header style={{ marginBottom: 'var(--space-4)', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{new Date().toDateString()}</h1>
                </header>
                <main>
                    {children}
                </main>
            </div>
        </>
    )
}
