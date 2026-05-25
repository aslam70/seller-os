import { useState } from "react";
import { X, Check, Zap, Sparkles, Loader2 } from "lucide-react";
import { useSubscription } from "../features/subscription/hooks/useSubscription";
import toast from "react-hot-toast";

export default function SaaSUpgradeModal({ show, onClose, title = "Upgrade Plan" }) {
  const { tier, plans, upgradeTo } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);

  if (!show) return null;

  const handleSimulateUpgrade = () => {
    if (!selectedPlan) return;
    setProcessing(true);
    setTimeout(() => {
      upgradeTo(selectedPlan.id);
      setProcessing(false);
      setSelectedPlan(null);
      toast.success(`Upgraded to ${selectedPlan.name}! (demo — no real charge)`);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={() => { if (!processing) onClose(); }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in z-10">

        {/* Close */}
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <Zap size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-xs text-gray-400">Unlock advanced analytics, bulk CSV operations & higher order limits.</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {!selectedPlan ? (
            /* Pricing Cards */
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
                        ? "ring-2 ring-emerald-500 border-transparent shadow-lg"
                        : "border-gray-100 hover:border-emerald-300 hover:shadow-xl"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-4 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                        Current Plan
                      </span>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                          isEnterprise ? "bg-purple-100 text-purple-700" : isGrower ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {plan.id}
                        </span>
                        {isEnterprise && <Sparkles size={12} className="text-purple-500" />}
                      </div>

                      <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">{plan.name}</h3>

                      <div className="flex items-baseline gap-1 my-3">
                        <span className="text-3xl font-black text-gray-900">৳{plan.price.toLocaleString()}</span>
                        {plan.price > 0 && <span className="text-xs text-gray-400 font-bold">/ month</span>}
                      </div>

                      <div className="border-t border-gray-50 pt-4 space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-500 font-medium">
                            <Check size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      disabled={isActive}
                      onClick={() => setSelectedPlan(plan)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition mt-6 cursor-pointer ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100 pointer-events-none"
                          : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow-md"
                      }`}
                    >
                      {isActive ? "Active Now" : "Select Plan"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Demo Confirmation — no credential fields */
            <div className="max-w-sm mx-auto text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                <Zap size={28} className="text-emerald-600" />
              </div>

              <div>
                <h3 className="text-base font-black text-gray-900 mb-1">{selectedPlan.name}</h3>
                <p className="text-3xl font-black text-gray-800">৳{selectedPlan.price.toLocaleString()}<span className="text-sm text-gray-400 font-bold"> / month</span></p>
              </div>

              {/* Demo callout — clearly NOT a real payment form */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <p className="text-xs font-black text-amber-800 uppercase tracking-wide mb-1">⚠ Demo Mode</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  This is a sandbox environment. No payment is processed and no real account is charged.
                  Click <strong>Simulate Upgrade</strong> to switch tiers instantly for testing.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={processing}
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 py-2.5 text-xs font-bold border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={processing}
                  onClick={handleSimulateUpgrade}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 text-xs font-bold shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer rounded-xl"
                >
                  {processing ? (
                    <><Loader2 size={12} className="animate-spin" /> Activating...</>
                  ) : (
                    "Simulate Upgrade"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
