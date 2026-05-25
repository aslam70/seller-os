import { useState, useMemo } from "react";
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Phone,
  Send,
  Copy,
  CheckCircle,
  MapPin,
  Clock,
  ExternalLink,
  Lock,
} from "lucide-react";
import { STATUS_COLORS } from "../../orders/ordersConstants";
import { riskLevel, customerSpent, RISK_CONFIG } from "../hooks/useCustomers";
import { useSubscription } from "../../subscription/hooks/useSubscription";
import SaaSUpgradeModal from "../../../components/SaaSUpgradeModal";
import toast from "react-hot-toast";

export default function CustomerPanel({ customer }) {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const { tier } = useSubscription();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const risk = riskLevel(customer.orders);
  const spent = customerSpent(customer.orders);
  const returns = customer.orders.filter((o) => o.status === "returned").length;
  const delivered = customer.orders.filter((o) => o.status === "delivered").length;
  const successRate = customer.orders.length > 0 ? Math.round((delivered / customer.orders.length) * 100) : 0;

  // Get customer details (latest phone/address from latest order if not filled on customer profile)
  const latestOrder = useMemo(() => {
    if (!customer.orders || customer.orders.length === 0) return null;
    return [...customer.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [customer]);

  const phone = customer.phone || latestOrder?.phone || "";
  const address = customer.address || latestOrder?.address || "";

  // Pre-made message templates
  const templates = useMemo(() => {
    if (!latestOrder) return [];
    
    // Clean phone number for WhatsApp API (needs 880 prefix and no spaces/symbols)
    let cleanPhone = phone.replace(/[\s\-\+]/g, "");
    if (cleanPhone.startsWith("01")) {
      cleanPhone = "880" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("1")) {
      cleanPhone = "880" + cleanPhone;
    }

    const orderTotal = latestOrder.amount + (latestOrder.deliveryCharge || 60);

    const items = [
      {
        id: "confirm",
        label: "Order Confirmed",
        text: `Hi ${customer.name},\n\nYour order for "${latestOrder.product}" has been confirmed! \n\n💰 Total Amount: ৳${orderTotal} (including delivery charge)\n🚚 Shipping via: ${latestOrder.courier || "Pathao"}\n📍 Address: ${address || "Provided address"}\n\nThank you for shopping with us! Let us know if you need to make any changes.`,
      },
      {
        id: "shipped",
        label: "Shipping Alert",
        text: `Hi ${customer.name},\n\nGood news! Your order "${latestOrder.product}" has been packed and shipped via ${latestOrder.courier || "Pathao"}.\n\nIt should reach you in 2-3 business days. Please keep your phone active to receive the delivery rider's call.\n\nThank you for your patience!`,
      },
      {
        id: "followup",
        label: "Returned Follow-up",
        text: `Hi ${customer.name},\n\nWe noticed that your delivery for "${latestOrder.product}" was returned to us. \n\nIs there any issue with the address or contact details? We would love to resend it if you are still interested.\n\nPlease let us know. Thank you!`,
      },
    ];

    return items.map((item) => {
      const encodedText = encodeURIComponent(item.text);
      return {
        ...item,
        whatsappUrl: `https://wa.me/${cleanPhone}?text=${encodedText}`,
        smsUrl: `sms:${phone}?body=${encodedText}`,
      };
    });
  }, [customer, latestOrder, phone, address]);

  const [selectedTemplate, setSelectedTemplate] = useState("confirm");
  const activeTemplateText = templates.find((t) => t.id === selectedTemplate)?.text || "";
  const activeTemplateUrls = templates.find((t) => t.id === selectedTemplate) || {};

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTemplateText);
    toast.success("Template copied to clipboard!");
  };

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 shadow-xs animate-fade-in">
      {/* Left side: Profile details & Messaging panel */}
      <div className="flex-1 space-y-6">
        <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-lg font-black text-white shrink-0">
            {customer.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{customer.name}</h2>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-0.5 hover:underline"
              >
                <Phone size={10} /> {phone}
              </a>
            )}
            {address && (
              <div className="text-[10px] text-gray-400 mt-1 flex items-start gap-1">
                <MapPin size={10} className="shrink-0 mt-0.5" />
                <span className="leading-tight">{address}</span>
              </div>
            )}
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-lg border font-bold ${RISK_CONFIG[risk].class}`}
          >
            {RISK_CONFIG[risk].label}
          </span>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Orders Total",
              value: customer.orders.length,
              icon: ShoppingBag,
              color: "text-blue-600",
              bg: "bg-blue-50/70",
            },
            {
              label: "Spent",
              value: `৳${spent.toLocaleString()}`,
              icon: TrendingUp,
              color: "text-emerald-600",
              bg: "bg-emerald-50/70",
            },
            {
              label: "Returns",
              value: returns,
              icon: AlertTriangle,
              color: "text-red-600",
              bg: "bg-red-50/70",
            },
            {
              label: "Success Rate",
              value: `${successRate}%`,
              icon: CheckCircle,
              color: "text-purple-600",
              bg: "bg-purple-50/70",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl p-3 border border-transparent`}>
              <Icon size={14} className={`${color} mb-1.5`} />
              <p className="text-base font-black text-gray-800 tracking-tight">{value}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* WhatsApp & SMS communications panel */}
        {latestOrder ? (
          <div className="relative overflow-hidden bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/50 pb-2.5">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <MessageSquare size={14} className="text-emerald-600" /> Customer Engagement Box
              </span>
              {/* Template selector pills */}
              <div className="flex gap-1">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (tier !== "free") setSelectedTemplate(t.id);
                    }}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold transition cursor-pointer ${
                      selectedTemplate === t.id
                        ? "bg-white text-emerald-700 shadow-xs border border-gray-200"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <textarea
                value={activeTemplateText}
                readOnly
                rows={5}
                className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none custom-scrollbar leading-relaxed font-medium text-gray-600 select-all"
              />
              <button
                onClick={handleCopy}
                title="Copy template"
                className="absolute right-3.5 bottom-3.5 w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center hover:bg-gray-800 transition cursor-pointer"
              >
                <Copy size={12} />
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={activeTemplateUrls.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
              >
                <Send size={12} /> Open WhatsApp <ExternalLink size={10} />
              </a>
              <a
                href={activeTemplateUrls.smsUrl}
                className="inline-flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Draft SMS
              </a>
            </div>

            {/* Premium Gating Blur Overlay */}
            {tier === "free" && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10 flex flex-col items-center justify-center text-center p-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 mb-2 shadow-2xs">
                  <Lock size={14} />
                </div>
                <p className="text-xs font-black text-gray-800 uppercase tracking-wider mb-0.5">Customer Engagement Drafts</p>
                <p className="text-[9px] text-gray-500 max-w-xs mb-3 leading-normal font-medium">
                  Instant order confirmation WhatsApp alerts & follow-ups require a Grower Plan upgrade.
                </p>
                <button
                  onClick={() => setPaywallOpen(true)}
                  className="text-[9px] font-black px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition cursor-pointer"
                >
                  Unlock Template Engagement
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center text-xs text-gray-400">
            Create an order first to draft confirmation or tracking messages
          </div>
        )}
      </div>

      {/* Right side: Complete Order History */}
      <div className="w-full md:w-80 shrink-0 flex flex-col pt-4 md:pt-0 md:pl-6 md:border-l border-gray-100/80">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
          <Clock size={12} /> Purchase Timeline
        </p>
        <div className="flex-1 space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
          {customer.orders.map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between p-3 border border-gray-100 bg-gray-50/50 rounded-xl hover:border-gray-200 transition"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-gray-800 truncate" title={o.product}>
                  {o.product}
                </p>
                <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                  {o.payment} · {o.courier}
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-black text-gray-800">
                  ৳{o.amount}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md border font-bold capitalize mt-1 ${STATUS_COLORS[o.status]}`}
                >
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SaaS Upgrade Modal */}
      <SaaSUpgradeModal 
        show={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        title="Unlock Engagement Templates"
      />
    </div>
  );
}
