import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: "expense" | "investment";
  title: string;
  amount: number;
  category: string;
  createdAt: Timestamp;
}

const EXPENSE_CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Health", "Other"];
const INVESTMENT_CATEGORIES = ["Stocks", "Crypto", "Mutual Funds", "Real Estate", "Bonds", "Other"];

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [activeTab, setActiveTab] = useState<"expense" | "investment">("expense");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(data);
    });

    return unsub;
  }, [user, authLoading, navigate]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !amount || !category) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: activeTab,
        title,
        amount: parseFloat(amount),
        category,
        createdAt: Timestamp.now(),
      });
      setTitle("");
      setAmount("");
      setCategory("");
      toast.success(`${activeTab === "expense" ? "Expense" : "Investment"} added!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to add");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      toast.success("Deleted");
    } catch (err: any) {
      toast.error("Failed to delete");
    }
  };

  const expenses = transactions.filter((t) => t.type === "expense");
  const investments = transactions.filter((t) => t.type === "investment");
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const totalInvestments = investments.reduce((s, t) => s + t.amount, 0);

  const categories = activeTab === "expense" ? EXPENSE_CATEGORIES : INVESTMENT_CATEGORIES;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-expense" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="font-display text-2xl font-bold text-card-foreground">
                ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <TrendingUp className="h-6 w-6 text-investment" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Investments</p>
              <p className="font-display text-2xl font-bold text-card-foreground">
                ${totalInvestments.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "expense" | "investment"); setCategory(""); }}>
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="expense">Expenses</TabsTrigger>
            <TabsTrigger value="investment">Investments</TabsTrigger>
          </TabsList>

          {["expense", "investment"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {/* Add Form */}
              <form onSubmit={handleAdd} className="mb-8 rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add {tab === "expense" ? "Expense" : "Investment"}
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Groceries" required className="mt-1" />
                  </div>
                  <div>
                    <Label>Amount ($)</Label>
                    <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="mt-1" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="mt-4" disabled={submitting || !category}>
                  {submitting ? "Adding..." : "Add"}
                </Button>
              </form>

              {/* List */}
              <div className="space-y-3">
                {(tab === "expense" ? expenses : investments).length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">
                    No {tab === "expense" ? "expenses" : "investments"} yet. Add one above!
                  </p>
                ) : (
                  (tab === "expense" ? expenses : investments).map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50">
                      <div>
                        <p className="font-medium text-card-foreground">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.category} • {t.createdAt?.toDate?.()?.toLocaleDateString() ?? ""}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-display font-semibold ${t.type === "expense" ? "text-expense" : "text-investment"}`}>
                          {t.type === "expense" ? "-" : "+"}${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
