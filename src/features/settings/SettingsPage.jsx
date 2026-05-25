import { useState, useEffect } from "react";
import { useAuth } from "../auth/hooks/useAuth";
import { useOrders } from "../orders/hooks/useOrders";
import { useSubscription } from "../subscription/hooks/useSubscription";
import {
  Settings,
  CreditCard,
  Check,
  Shield,
  Percent,
  ChevronRight,
  Loader2,
  Lock,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_SETTINGS = {
  shopName: "My Digital Store",
  contactPhone: "",
  insideDhakaFee: "60",
  outsideDhakaFee: "120",
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { tier, plan, orderLimit, upgradeTo, plans } = useSubscription(orders.length);

  const [activeTab, setActiveTab] = useState("shop"); // 'shop', 'billing', or 'enterprise'
  const [shopSettings, setShopSettings] = useState({ ...DEFAULT_SETTINGS });
  const [savingSettings, setSavingSettings] = useState(false);

  // Upgrade simulator state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [simulatedPaymentMethod, setSimulatedPaymentMethod] = useState("bKash");
  const [simulating, setSimulating] = useState(false);

  // Support Chat simulator state
  const [chatMessages, setChatMessages] = useState([]);
  const [supportInput, setSupportInput] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);

  // Load shop settings
  useEffect(() => {
    if (!user) return;
    const key = `seller_os_settings_${user.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setShopSettings(JSON.parse(saved));
    }
  }, [user]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingSettings(true);

    setTimeout(() => {
      const key = `seller_os_settings_${user.id}`;
      localStorage.setItem(key, JSON.stringify(shopSettings));
      setSavingSettings(false);
      toast.success("Shop settings saved successfully!");
    }, 800);
  };

  const handleSimulatePayment = () => {
    if (!selectedPlan) return;
    setSimulating(true);

    setTimeout(() => {
      upgradeTo(selectedPlan.id);
      setSimulating(false);
      setSelectedPlan(null);
      toast.success(`Welcome to the ${selectedPlan.name}! All quotas unlocked.`);
    }, 1500);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    const userMsg = { sender: "user", text: supportInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const query = supportInput;
    setSupportInput("");

    // Simulate VIP agent typing response
    setAgentTyping(true);
    setTimeout(() => {
      setAgentTyping(false);
      let replyText = "Understood. I've logged your request and our premium assistance team will get right on it. Is there anything else you need help with?";
      if (query.toLowerCase().includes("domain") || query.toLowerCase().includes("dns")) {
        replyText = "Custom domain mapping is available for Enterprise clients. I'll pass your CNAME mapping request to our DNS desk to configure it immediately.";
      } else if (query.toLowerCase().includes("limit") || query.toLowerCase().includes("quota")) {
        replyText = "As an Enterprise plan client, all order, product, and customer record limits are completely removed from your account. Infinite bandwidth unlocked!";
      } else if (query.toLowerCase().includes("hello") || query.toLowerCase().includes("hi")) {
        replyText = "Hello! Welcome back to VIP priority support desk. I'm Asif, your account support agent. How may I serve you today?";
      }
      setChatMessages((prev) => [...prev, { sender: "agent", text: replyText }]);
    }, 1500);
  };

  // Quota percentage
  const usagePercentage = orderLimit === Infinity ? 0 : Math.round((orders.length / orderLimit) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Control Center</h1>
        <p className="text-xs text-gray-400 mt-0.5">Customize shop details & subscription plan</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-4">
        <button
          onClick={() => setActiveTab("shop")}
          className={`pb-3 text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "shop"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Settings size={15} /> Shop Configuration
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`pb-3 text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "billing"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <CreditCard size={15} /> Billing & Subscription
        </button>
        <button
          onClick={() => setActiveTab("enterprise")}
          className={`pb-3 text-sm font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === "enterprise"
              ? "border-b-2 border-emerald-600 text-emerald-700"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Shield size={15} /> Enterprise Perks
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "shop" && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">Default Shop Settings</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Shop / Business Name</label>
              <input
                type="text"
                required
                value={shopSettings.shopName}
                onChange={(e) => setShopSettings({ ...shopSettings, shopName: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contact Hotline</label>
              <input
                type="text"
                placeholder="01xxxxxxxxx"
                value={shopSettings.contactPhone}
                onChange={(e) => setShopSettings({ ...shopSettings, contactPhone: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Default Inside Dhaka Delivery Fee (৳)</label>
              <input
                type="number"
                required
                value={shopSettings.insideDhakaFee}
                onChange={(e) => setShopSettings({ ...shopSettings, insideDhakaFee: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Default Outside Dhaka Delivery Fee (৳)</label>
              <input
                type="number"
                required
                value={shopSettings.outsideDhakaFee}
                onChange={(e) => setShopSettings({ ...shopSettings, outsideDhakaFee: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="text-xs px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-150 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {savingSettings ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === "billing" && (
        <div className="space-y-6 animate-fade-in">
          {/* Visual Usage Progress Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Current Account Usage</h3>
              <p className="text-2xl font-black text-gray-800 tracking-tight capitalize">
                {tier} Plan Active
              </p>
              <p className="text-xs text-gray-400 max-w-sm">
                You are currently utilizing {orders.length} orders out of your plan limit ({orderLimit === Infinity ? "Unlimited" : `${orderLimit} orders`}).
              </p>
            </div>

            {orderLimit !== Infinity && (
              <div className="w-full md:w-72 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                  <span>Quota Utilized</span>
                  <span>{orders.length} / {orderLimit} Orders</span>
                </div>
                <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden border border-gray-200/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercentage >= 90
                        ? "bg-red-500"
                        : usagePercentage >= 70
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                {usagePercentage >= 90 && (
                  <p className="text-[10px] font-bold text-red-500 animate-pulse">
                    Quota almost filled! Upgrade to unlock limits.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(plans).map((p) => {
              const isActive = tier === p.id;
              let btnClass = "border border-gray-200 hover:bg-gray-50 text-gray-700";
              let btnLabel = "Upgrade Plan";
              if (isActive) {
                btnClass = "bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold pointer-events-none";
                btnLabel = "Active Now";
              }

              return (
                <div
                  key={p.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[360px] relative transition-all duration-300 ${
                    isActive ? "ring-2 ring-emerald-500 border-transparent scale-102 shadow-md" : "border-gray-100 hover:shadow-md"
                  }`}
                >
                  <div>
                    {isActive && (
                      <span className="absolute top-3.5 right-3.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                        Current
                      </span>
                    )}

                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide mb-1">
                      {p.name}
                    </h4>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-black text-gray-900">
                        ৳{p.price.toLocaleString()}
                      </span>
                      {p.price > 0 && <span className="text-xs text-gray-400 font-bold">/ month</span>}
                    </div>

                    <div className="border-t border-gray-50 pt-4 space-y-2.5">
                      {p.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-500">
                          <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!isActive) setSelectedPlan(p);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition mt-6 cursor-pointer ${btnClass}`}
                  >
                    {btnLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "enterprise" && (
        <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 shadow-xs min-h-[420px] flex flex-col justify-between animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Custom Webhook Alerts Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">Custom SaaS Analytics Webhooks</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Webhook Endpoint URL</label>
                  <input
                    type="url"
                    defaultValue="https://api.mybusiness.com/seller-os/alerts"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-500">Event Triggers</label>
                  {[
                    { label: "Return rate exceeds 15%", checked: true },
                    { label: "Order value exceeds ৳5,000", checked: true },
                    { label: "High-risk customer phone flagged", checked: false },
                  ].map((trigger, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" defaultChecked={trigger.checked} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-400" />
                      <span>{trigger.label}</span>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toast.promise(
                      new Promise((resolve) => setTimeout(resolve, 1000)),
                      {
                        loading: "Firing mock webhook test alert...",
                        success: "Mock test payload sent successfully (HTTP 200 OK)!",
                        error: "Failed to fire webhook.",
                      }
                    );
                  }}
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Test Webhook Event
                </button>
              </div>
            </div>

            {/* Simulated Live Support Chat Panel */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-2">VIP 24/7 Priority Support Chat</h3>
                <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-xl h-44 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-800 shrink-0">A</div>
                      <div className="bg-white border border-gray-100 rounded-xl p-2 text-[10px] text-gray-600 leading-relaxed max-w-[80%]">
                        Hello! Welcome to SellerOS VIP Support. I am Asif, your dedicated agent. How can I help you automate or scale your shop today?
                      </div>
                    </div>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          msg.sender === "user" ? "bg-gray-200 text-gray-700" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {msg.sender === "user" ? "U" : "A"}
                        </div>
                        <div className={`rounded-xl p-2 text-[10px] leading-relaxed max-w-[80%] ${
                          msg.sender === "user" ? "bg-emerald-600 text-white font-medium animate-fade-in" : "bg-white border border-gray-100 text-gray-600 animate-fade-in"
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {agentTyping && (
                      <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-800 shrink-0">A</div>
                        <div className="bg-white border border-gray-100 rounded-xl p-2 text-[10px] text-gray-400 italic">
                          Asif is typing...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleSendMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Type support query..."
                  value={supportInput}
                  onChange={(e) => setSupportInput(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
                <button type="submit" className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Premium Gating Blur Overlay */}
          {tier !== "enterprise" && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-3 shadow-2xs">
                <Lock size={18} />
              </div>
              <p className="text-sm font-black text-gray-800 uppercase tracking-wider mb-1">Enterprise Plan Perks Locked</p>
              <p className="text-xs text-gray-500 max-w-sm mb-4 leading-normal font-medium">
                Custom webhook event alerts and priority 24/7 live support chats are exclusive Enterprise Tier features. Upgrade now to connect.
              </p>
              <button
                onClick={() => {
                  setSelectedPlan(plans.enterprise);
                }}
                className="text-xs font-black px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={13} className="animate-pulse" /> Upgrade to Enterprise Plan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Simulated Payment Portal Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setSelectedPlan(null)} />

          <div className="relative w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Shield size={18} className="text-emerald-600" />
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Secure Checkout Portal</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">SaaS Billing Upgrade Simulator</p>
              </div>
            </div>

            {/* Plan Info */}
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-gray-700 block">{selectedPlan.name} Subscription</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Recurring billing monthly</span>
              </div>
              <span className="font-black text-gray-900 text-sm">৳{selectedPlan.price.toLocaleString()}</span>
            </div>

            {/* Mobile Banking Options */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Choose Payment Wallet</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "bKash", color: "bg-pink-50 border-pink-200 text-pink-700 font-black", label: "bKash" },
                  { id: "Nagad", color: "bg-orange-50 border-orange-200 text-orange-700 font-extrabold", label: "Nagad" },
                  { id: "Rocket", color: "bg-purple-50 border-purple-200 text-purple-700 font-bold", label: "Rocket" },
                ].map((wallet) => {
                  const isChosen = simulatedPaymentMethod === wallet.id;
                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => setSimulatedPaymentMethod(wallet.id)}
                      className={`py-2 rounded-xl text-xs border text-center transition cursor-pointer ${wallet.color} ${
                        isChosen ? "ring-2 ring-offset-2 ring-emerald-500 scale-102 border-transparent" : "opacity-60"
                      }`}
                    >
                      {wallet.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Fields (Dummy Simulation) */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Account Number</label>
                <input
                  type="text"
                  placeholder="01xxxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Simulated 4-Digit PIN</label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white tracking-widest pl-8"
                  />
                  <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedPlan(null)}
                className="flex-1 py-2.5 text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={simulating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-2.5 text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {simulating ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Upgrading...
                  </>
                ) : (
                  <>Pay ৳{selectedPlan.price.toLocaleString()}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
