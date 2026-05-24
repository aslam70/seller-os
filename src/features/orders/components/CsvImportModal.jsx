import { useState } from "react";
import { X, Upload, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../auth/hooks/useAuth";
import toast from "react-hot-toast";

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  
  if (lines.length < 2) return [];
  
  const headers = lines[0].map(h => h.trim().toLowerCase().replace(/[\s_]+/g, ""));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] ? values[idx].trim() : "";
    });
    rows.push(obj);
  }
  return rows;
}

export default function CsvImportModal({ show, onClose, onImport }) {
  const { user } = useAuth();
  const [csvText, setCsvText] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setCsvText(text);
        processText(text);
      }
    };
    reader.readAsText(file);
  };

  const processText = (text) => {
    try {
      setError("");
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setError("Invalid or empty CSV file. Make sure it contains headers and at least one row.");
        return;
      }

      // Check required headers
      const firstRow = rows[0];
      const hasCustomer = firstRow.customer !== undefined;
      const hasProduct = firstRow.product !== undefined;
      const hasAmount = firstRow.amount !== undefined;

      if (!hasCustomer || !hasProduct || !hasAmount) {
        setError("Missing required columns. Your CSV must contain: 'customer', 'product', and 'amount'.");
        return;
      }

      // Normalize data
      const normalized = rows.map((row, idx) => ({
        id: idx,
        customer: row.customer || "",
        phone: row.phone || "",
        address: row.address || "",
        product: row.product || "",
        amount: Number(row.amount) || 0,
        deliveryCharge: Number(row.deliverycharge || row.delivery_charge) || 60,
        payment: row.payment || "COD",
        status: (row.status || "pending").toLowerCase(),
        courier: row.courier || "Pathao",
        notes: row.notes || "",
        isValid: !!row.customer && !!row.product && !isNaN(Number(row.amount)),
      }));

      setParsedData(normalized);
    } catch (err) {
      setError("Failed to parse CSV. Please verify file formatting.");
      console.error(err);
    }
  };

  const handleImport = async () => {
    const validRows = parsedData.filter((r) => r.isValid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import.");
      return;
    }

    setLoading(true);
    try {
      // Sync Unique Products to DB
      const uniqueProducts = Array.from(new Set(validRows.map((r) => r.product)));
      if (uniqueProducts.length > 0) {
        // Fetch existing products
        const { data: existingProds } = await supabase
          .from("products")
          .select("name")
          .eq("user_id", user.id);

        const existingNames = new Set((existingProds || []).map((p) => p.name.toLowerCase()));
        const prodsToInsert = uniqueProducts
          .filter((name) => !existingNames.has(name.toLowerCase()))
          .map((name) => {
            const matchingRow = validRows.find((r) => r.product === name);
            return {
              name,
              price: matchingRow ? matchingRow.amount : 0,
              user_id: user.id,
            };
          });

        if (prodsToInsert.length > 0) {
          await supabase.from("products").insert(prodsToInsert);
        }
      }

      // Sync Unique Customers to DB
      const customerMap = {};
      validRows.forEach((r) => {
        const key = `${r.customer.toLowerCase().trim()}_${r.phone}`;
        if (!customerMap[key]) {
          customerMap[key] = { name: r.customer.trim(), phone: r.phone, address: r.address };
        }
      });

      const uniqueCustomers = Object.values(customerMap);
      if (uniqueCustomers.length > 0) {
        // Fetch existing customers
        const { data: existingCusts } = await supabase
          .from("customers")
          .select("name, phone")
          .eq("user_id", user.id);

        const existingKeys = new Set(
          (existingCusts || []).map((c) => `${c.name.toLowerCase().trim()}_${c.phone || ""}`)
        );

        const custsToInsert = uniqueCustomers
          .filter((c) => !existingKeys.has(`${c.name.toLowerCase()}_${c.phone}`))
          .map((c) => ({
            name: c.name,
            phone: c.phone,
            address: c.address,
            user_id: user.id,
          }));

        if (custsToInsert.length > 0) {
          await supabase.from("customers").insert(custsToInsert);
        }
      }

      // Import the orders!
      const success = await onImport(validRows);
      if (success) {
        onClose();
      }
    } catch (err) {
      toast.error("Import failed during sync.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />

      {/* Content Panel */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-100 rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">CSV Bulk Importer</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* Instructions and File Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-emerald-300 transition duration-150 relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload size={32} className="text-gray-300 mb-3" />
              <p className="text-xs font-bold text-gray-700">Drag & Drop or Click to Upload</p>
              <p className="text-[10px] text-gray-400 mt-1">Supports standard .csv file format</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                  <FileText size={14} className="text-emerald-600" /> Standard Column Structure
                </h3>
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Your CSV must include these core header columns:<br />
                  <span className="font-semibold text-gray-700">customer</span> (name),{" "}
                  <span className="font-semibold text-gray-700">product</span> (item name),{" "}
                  <span className="font-semibold text-gray-700">amount</span> (total price).
                </p>
                <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                  Optional columns: <span className="italic">phone, address, delivery_charge, payment, status, courier, notes</span>
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/50 flex gap-2">
                <textarea
                  placeholder="Or paste raw CSV text directly here..."
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    processText(e.target.value);
                  }}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg h-16 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-xs px-4 py-3 rounded-xl flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Parsing Error</p>
                <p className="opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {parsedData.length > 0 && !error && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-700">
                  Data Preview ({parsedData.length} records found)
                </span>
                <span className="text-[10px] text-gray-400">
                  {parsedData.filter((r) => r.isValid).length} valid,{" "}
                  {parsedData.filter((r) => !r.isValid).length} invalid
                </span>
              </div>

              <div className="border border-gray-100 rounded-xl overflow-hidden overflow-x-auto max-h-48 custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Payment</th>
                      <th className="px-4 py-2">Courier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-600">
                    {parsedData.map((row) => (
                      <tr key={row.id} className={row.isValid ? "hover:bg-gray-50/50" : "bg-red-50/20"}>
                        <td className="px-4 py-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                              <CheckCircle2 size={12} /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                              <AlertCircle size={12} /> Missing fields
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-semibold text-gray-800">{row.customer || "—"}</td>
                        <td className="px-4 py-2">{row.phone || "—"}</td>
                        <td className="px-4 py-2">{row.product || "—"}</td>
                        <td className="px-4 py-2 font-bold text-gray-800">৳{row.amount}</td>
                        <td className="px-4 py-2 capitalize">{row.payment}</td>
                        <td className="px-4 py-2">{row.courier}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 shrink-0 rounded-b-2xl">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-white text-gray-600 hover:text-gray-800 font-medium transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || parsedData.filter((r) => r.isValid).length === 0}
            className="text-xs px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Importing...
              </>
            ) : (
              <>Import {parsedData.filter((r) => r.isValid).length} Orders</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
