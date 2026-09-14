import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const features = [
  { icon: '🛡️', title: 'Pet Insurance Tracker',  description: "Monitor your pet's insurance policies, claims, and coverage details all in one place." },
  { icon: '🐾', title: 'Health Records',           description: 'Keep comprehensive medical histories, vaccinations, and vet visit records for every pet.' },
  { icon: '💊', title: 'Medication Reminders',     description: "Never miss a dose with smart reminders for all your pet's medications and treatments." },
  { icon: '📊', title: 'Expense Analytics',        description: 'Visualize and understand your pet care spending with detailed insights and reports.' },
  { icon: '🏥', title: 'Vet Directory',            description: 'Find trusted veterinarians nearby and schedule appointments seamlessly.' },
  { icon: '🔔', title: 'Smart Alerts',             description: 'Get notified about policy renewals, check-up schedules, and important milestones.' },
];

const stats = [
  { value: '50K+', label: 'Protected Pets' },
  { value: '98%',  label: 'Claim Success Rate' },
  { value: '4.9★', label: 'App Rating' },
  { value: '24/7', label: 'Support' },
];

// ── Auth-aware Navbar ─────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-gray-950/90 backdrop-blur-md border-b border-white/10 py-3' : 'py-5'
    }`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold gradient-text">FurShield</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#stats"    className="hover:text-white transition-colors">Stats</a>
          <a href="#contact"  className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={getDashboardPath(user?.role)} className="btn-outline text-sm px-4 py-2">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-400 transition-colors px-3">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-outline text-sm px-4 py-2">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Now in Beta – Join the Waitlist
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          Your Pet's{' '}
          <span className="gradient-text">Protection</span>
          <br />Starts Here
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          FurShield is the all-in-one platform to manage your pet's insurance, health records,
          and vet care — so you can focus on the moments that matter most.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base w-full sm:w-auto">
            🐾 Protect My Pet
          </Link>
          <a href="#features" className="btn-outline text-base w-full sm:w-auto">
            Learn More →
          </a>
        </div>

        <p className="mt-6 text-xs text-gray-600">
          No credit card required · Free for the first 30 days
        </p>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section id="stats" className="py-20 border-y border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center animate-slide-up">
              <p className="text-4xl md:text-5xl font-black gradient-text mb-2">{s.value}</p>
              <p className="text-gray-500 text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Everything your pet <span className="gradient-text">deserves</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Powerful tools designed to give pet owners total peace of mind.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 group cursor-pointer">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{f.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="glass-card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Ready to <span className="gradient-text">shield</span> your fur baby?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of pet parents who trust FurShield to keep their companions safe and healthy.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-500
                  focus:outline-none focus:border-primary-400 transition-colors"
              />
              <Link to="/register" className="btn-primary whitespace-nowrap w-full sm:w-auto">
                Join Waitlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-bold text-gray-400">FurShield</span>
        </div>
        <p className="text-gray-600 text-sm">© {new Date().getFullYear()} FurShield. All rights reserved.</p>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
