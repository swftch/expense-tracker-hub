import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, PiggyBank, BarChart3, Shield } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Track your{" "}
            <span className="text-primary">money</span>,{" "}
            grow your{" "}
            <span className="text-primary">wealth</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            A simple, beautiful way to manage your expenses and investments.
            Stay on top of your finances effortlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: PiggyBank, title: "Track Expenses", desc: "Log and categorize every expense to understand your spending habits." },
            { icon: BarChart3, title: "Monitor Investments", desc: "Keep all your investments in one place and watch your portfolio grow." },
            { icon: Shield, title: "Secure & Private", desc: "Your financial data is stored securely with Firebase authentication." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-card-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
