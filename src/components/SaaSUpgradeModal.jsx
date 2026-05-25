import { useState } from "react";
import { X, Check, Shield, Lock, Zap, Sparkles, Loader2 } from "lucide-react";
import { useSubscription } from "../features/subscription/hooks/useSubscription";
import toast from "react-hot-toast";

export default function SaaSUpgradeModal({ show, onClose, title = "Upgrade Plan", initialPlanId = null }) {
  const { tier, plans, upgradeTo } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentWallet, setPaymentWallet] = useState("bKash");
  const [accountNumber, setAccountNumber] = useState("");
  const [pinNumber, setPinNumber] = useState("");
  const [processing, setProcessing] = useState(false);

  if (!show) return null;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!accountNumber) {
      toast.error("Please enter your wallet account number.");
      return;
    }
    if (!pinNumber || pinNumber.length < 4) {
      toast.error("Please enter a valid 4-digit PIN.");
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      upgradeTo(selectedPlan.id);
      setProcessing(false);
      setSelectedPlan(null);
      setAccountNumber("");
      setPinNumber("");
      toast.success(`Success! Your workspace has been upgraded to the ${selectedPlan.name}.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glass backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => { if (!processing) onClose(); }} 
      />

      {/* Main Container */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in z-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          disabled={processing}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Modal Header */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Zap size={20} className="fill-emerald-100 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-xs text-gray-400">Unlock maximum capacity, advanced analytical insights & bulk CSV automation.</p>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {!selectedPlan ? (
            <div className="space-y-6">
              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(plans).map((plan) => {
                  const isActive = tier === plan.id;
                  const isEnterprise = plan.id === "enterprise";
                  const isGrower = plan.id === "grower";
                  
                  return (
                    <div
                      key={plan.id}
                      className={`relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 min-h-[380px] bg-white ${
                        isActive
                          ? "ring-2 ring-emerald-500 border-transparent shadow-emerald-500/5 shadow-lg scale-102"
                          : "border-gray-100 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/5"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          Current Plan
                        </span>
                      )}

                      <div>
                        {/* Tier Title */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                            isEnterprise ? "bg-purple-100 text-purple-700" : isGrower ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {plan.id}
                          </span>
                          {isEnterprise && <Sparkles size={12} className="text-purple-500 animate-pulse" />}
                        </div>

                        <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">
                          {plan.name}
                        </h3>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-1 my-3">
                          <span className="text-3xl font-black text-gray-900">
                            ৳{plan.price.toLocaleString()}
                          </span>
                          {plan.price > 0 && <span className="text-xs text-gray-400 font-bold">/ month</span>}
                        </div>

                        {/* Features List */}
                        <div className="border-t border-gray-50 pt-4 space-y-2.5">
                          {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-gray-500 font-medium">
                              <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        disabled={isActive}
                        onClick={() => handlePlanSelect(plan)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition mt-6 cursor-pointer ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100 pointer-events-none"
                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {isActive ? "Active Now" : "Select & Upgrade"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Integrated Checkout Portal */
            <div className="max-w-md mx-auto bg-gray-50/50 border border-gray-100 p-6 md:p-8 rounded-2xl space-y-6">
              
              {/* Portal Header */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
                <Shield size={18} className="text-emerald-600 animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Secure Mobile Payment Portal</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Choose your wallet & verify transaction</p>
                </div>
              </div>

              {/* Selected Plan Summary Card */}
              <div className="bg-white border border-gray-100 p-4 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-700 block">{selectedPlan.name} Plan Upgrade</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Billed monthly (Mock transaction)</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900 text-sm block">৳{selectedPlan.price.toLocaleString()}</span>
                  <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wide bg-emerald-50 px-1.5 py-0.5 rounded-md mt-1 inline-block">SECURE</span>
                </div>
              </div>

              {/* Wallet Toggles */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Select Mobile Wallet</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "bKash", color: "bg-pink-50 border-pink-100 text-pink-700 font-black", label: "bKash" },
                    { id: "Nagad", color: "bg-orange-50 border-orange-100 text-orange-700 font-extrabold", label: "Nagad" },
                    { id: "Rocket", color: "bg-purple-50 border-purple-100 text-purple-700 font-bold", label: "Rocket" },
                  ].map((wallet) => {
                    const isChosen = paymentWallet === wallet.id;
                    return (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => setPaymentWallet(wallet.id)}
                        className={`py-2 rounded-xl text-xs border text-center transition-all cursor-pointer ${wallet.color} ${
                          isChosen ? "ring-2 ring-emerald-500 scale-102 border-transparent font-black" : "opacity-50"
                        }`}
                      >
                        {wallet.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Payment Fields */}
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Account Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="01xxxxxxxxx"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Simulated 4-Digit Wallet PIN</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="••••"
                      value={pinNumber}
                      onChange={(e) => setPinNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white tracking-widest pl-10"
                    />
                    <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1 flex items-center gap-1 leading-normal">
                    <Shield size={10} className="shrink-0 text-emerald-500" /> Sandbox payment. Input any mock values to complete transaction.
                  </p>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 py-2.5 text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition cursor-pointer"
                  >
                    Back to Plans
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-150 disabled:text-gray-400 text-white py-2.5 text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={12} className="animate-spin" /> Verifying...
                      </>
                    ) : (
                      <>Pay & Activate Plan</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
