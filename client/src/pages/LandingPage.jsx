import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: '🛡️', title: 'Pet Insurance Tracker',  description: "Monitor your pet's insurance policies, claims, and coverage details—all in one organised record." },
  { icon: '🐾', title: 'Health Records',           description: 'Keep comprehensive medical histories, vaccinations, and vet visit records for every pet in the family.' },
  { icon: '💊', title: 'Medication Reminders',     description: "Never miss a dose. Smart reminders for all treatments, tick preventions, and supplements." },
  { icon: '📊', title: 'Expense Analytics',        description: 'Understand your pet care spending with clear, honest insights—no dark patterns.' },
  { icon: '🏥', title: 'Vet Appointments',         description: 'Find trusted veterinarians and schedule appointments without the phone-tag.' },
  { icon: '🔔', title: 'Smart Alerts',             description: 'Timely nudges for policy renewals, check-up schedules, and vaccination milestones.' },
];

const stats = [
  { value: '50K+', label: 'Protected Pets' },
  { value: '98%',  label: 'Claim Success Rate' },
  { value: '4.9★', label: 'App Rating' },
  { value: '24/7', label: 'Support' },
];

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#FBF7F0]/95 backdrop-blur-sm border-b border-[#E8E2D9] py-3 shadow-warm-sm' : 'py-5'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">🐾</span>
          <span className="font-['Fraunces'] text-xl font-semibold text-primary-800 tracking-tight">FurShield</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#features" className="hover:text-primary-700 transition-colors duration-150">Features</a>
          <a href="#stats"    className="hover:text-primary-700 transition-colors duration-150">Trust</a>
          <a href="#contact"  className="hover:text-primary-700 transition-colors duration-150">Join</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath(user?.role)} className="btn-outline text-sm px-4 py-2">Dashboard</Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-outline text-sm px-4 py-2">Sign In</Link>
              <Link to="/register" className="btn-accent text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 bg-page overflow-hidden">
      {/* Warm, static background texture — no pulsing blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #C9DCC9 0%, transparent 70%)', transform: 'translate(30%, -20%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #E8AF95 0%, transparent 70%)', transform: 'translate(-30%, 20%)' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-300 bg-primary-50 text-primary-700 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" aria-hidden="true" />
          Now in Beta — Join the Waitlist
        </div>

        <h1 className="font-['Fraunces'] text-5xl md:text-7xl font-600 leading-[1.1] mb-6 text-primary-900">
          Your Pet's{' '}
          <em className="not-italic" style={{
            background: 'linear-gradient(135deg, #4F6B54 0%, #7FA087 60%, #9BA187 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>Protection</em>
          <br />Starts Here
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          FurShield is the all-in-one platform to manage your pet's insurance, health records,
          and vet care — so you can focus on the moments that matter most.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-accent text-base w-full sm:w-auto px-8 py-3.5">
            Protect My Pet →
          </Link>
          <a href="#features" className="btn-outline text-base w-full sm:w-auto px-8 py-3.5">
            See How It Works
          </a>
        </div>

        <p className="mt-6 text-xs text-subtle">
          No credit card required · Free for the first 30 days
        </p>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsSection() {
  return (
    <section id="stats" className="py-20 bg-primary-50 border-y border-primary-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="stat-pill animate-slide-up">
              <p className="font-['Fraunces'] text-4xl md:text-5xl font-semibold text-primary-700 mb-1">{s.value}</p>
              <p className="text-muted text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-page">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-['Fraunces'] text-4xl md:text-5xl font-semibold mb-4 text-primary-900">
            Everything your pet{' '}
            <span style={{
              background: 'linear-gradient(135deg, #4F6B54 0%, #7FA087 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>deserves</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto font-light">
            Purposeful tools designed to give pet owners real peace of mind.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={f.title}
              id={`feature-${f.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="card p-7 group cursor-default hover:shadow-warm-md transition-shadow duration-200">
              <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl mb-5
                group-hover:bg-primary-200 transition-colors duration-150" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="font-['Fraunces'] text-lg font-semibold text-primary-900 mb-2">{f.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section id="contact" className="py-24 bg-primary-50">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="card-surface p-12 relative overflow-hidden">
          {/* Subtle warm tint — not a gradient blob */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C9DCC9 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="relative z-10">
            <h2 className="font-['Fraunces'] text-4xl md:text-5xl font-semibold mb-4 text-primary-900">
              Ready to shield your fur baby?
            </h2>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto font-light">
              Join thousands of pet parents who trust FurShield to keep their companions safe and healthy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="form-input flex-1"
              />
              <Link to="/register" className="btn-accent whitespace-nowrap w-full sm:w-auto px-6 py-3">
                Join Waitlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#E8E2D9] py-10 bg-page">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl" aria-hidden="true">🐾</span>
          <span className="font-['Fraunces'] font-semibold text-primary-800">FurShield</span>
        </div>
        <p className="text-subtle text-sm">© {new Date().getFullYear()} FurShield. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-muted">
          <a href="#" className="hover:text-primary-700 transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary-700 transition-colors">Terms</a>
          <a href="#" className="hover:text-primary-700 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
