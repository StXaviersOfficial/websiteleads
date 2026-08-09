"use client";

import { useEffect, useState, useMemo, useRef } from "react";

interface Lead {
  id: number;
  name: string;
  type: string;
  country: string;
  countryCode: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  rating: number;
  estimatedRevenue: number;
  description: string;
  status: "pending" | "accepted" | "rejected" | "maybe";
  topPick: boolean;
}

type FilterType = "all" | "pending" | "accepted" | "rejected" | "maybe" | "top";

const PAGE_SIZE = 24;

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, accepted: 0, rejected: 0, maybe: 0, pending: 0, topPicks: 0 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load leads + localStorage status
  useEffect(() => {
    fetch("/leads.json")
      .then((r) => r.json())
      .then((data) => {
        const stored = JSON.parse(localStorage.getItem("leadStatuses") || "{}");
        const leadsWithStatus = data.leads.map((l: Lead) => ({
          ...l,
          status: stored[l.id] || "pending",
        }));
        setLeads(leadsWithStatus);
        setLoading(false);
        updateStats(leadsWithStatus);
      });
  }, []);

  const updateStats = (allLeads: Lead[]) => {
    setStats({
      total: allLeads.length,
      accepted: allLeads.filter((l) => l.status === "accepted").length,
      rejected: allLeads.filter((l) => l.status === "rejected").length,
      maybe: allLeads.filter((l) => l.status === "maybe").length,
      pending: allLeads.filter((l) => l.status === "pending").length,
      topPicks: allLeads.filter((l) => l.topPick).length,
      realLeads: allLeads.filter((l) => l.isReal).length,
    });
  };

  const setStatus = (id: number, status: Lead["status"]) => {
    const stored = JSON.parse(localStorage.getItem("leadStatuses") || "{}");
    stored[id] = status;
    localStorage.setItem("leadStatuses", JSON.stringify(stored));
    const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
    setLeads(updated);
    updateStats(updated);
  };

  // Filter + search
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filter === "real" && !l.isReal) return false; if (filter === "top" && !l.topPick) return false;
      if (filter !== "all" && filter !== "top" && l.status !== filter) return false;
      if (countryFilter !== "all" && l.country !== countryFilter) return false;
      if (typeFilter !== "all" && l.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          l.name.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q) ||
          l.type.toLowerCase().includes(q) ||
          l.phone.includes(q)
        );
      }
      return true;
    });
  }, [leads, filter, search, countryFilter, typeFilter]);

  const visibleLeads = filtered.slice(0, visibleCount);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filtered.length) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filter, search, countryFilter, typeFilter]);

  const countries = useMemo(() => [...new Set(leads.map((l) => l.country))].sort(), [leads]);
  const types = useMemo(() => [...new Set(leads.map((l) => l.type))].sort(), [leads]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#22D3EE", marginBottom: "1rem" }}>QuackForge Leads</div>
          <div style={{ color: "#7AA5CC" }}>Loading 11,200 business leads...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", maxWidth: "1400px", margin: "0 auto", padding: "16px" }}>
      {/* Header */}
      <header style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "#22D3EE" }}>
              QuackForge Business Leads
            </h1>
            <p style={{ fontSize: "0.85rem", color: "#7AA5CC", margin: "4px 0 0 0" }}>
              {stats.total.toLocaleString()} businesses without websites worldwide
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <StatBadge label="Top Picks" count={stats.topPicks} color="#F59E0B" />
            <StatBadge label="Accepted" count={stats.accepted} color="#10B981" />
            <StatBadge label="Maybe" count={stats.maybe} color="#F59E0B" />
            <StatBadge label="Rejected" count={stats.rejected} color="#EF4444" />
            <StatBadge label="Pending" count={stats.pending} color="#7AA5CC" />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="All" count={stats.total} />
        <FilterButton active={filter === "real"} onClick={() => setFilter("real")} label="✓ REAL Verified" count={stats.realLeads} />
        <FilterButton active={filter === "top"} onClick={() => setFilter("top")} label="⭐ Top Picks" count={stats.topPicks} />
        <FilterButton active={filter === "accepted"} onClick={() => setFilter("accepted")} label="✓ Accepted" count={stats.accepted} />
        <FilterButton active={filter === "maybe"} onClick={() => setFilter("maybe")} label="? Maybe" count={stats.maybe} />
        <FilterButton active={filter === "rejected"} onClick={() => setFilter("rejected")} label="✗ Rejected" count={stats.rejected} />
        <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label="Pending" count={stats.pending} />
      </div>

      {/* Search + dropdowns */}
      <div style={{ marginBottom: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name, city, country, type, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8,
            background: "#0F2147", border: "1px solid #22D3EE33", color: "#E6FBFF",
            fontSize: "0.9rem", outline: "none",
          }}
        />
        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, background: "#0F2147", border: "1px solid #22D3EE33", color: "#E6FBFF", fontSize: "0.9rem" }}
        >
          <option value="all">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, background: "#0F2147", border: "1px solid #22D3EE33", color: "#E6FBFF", fontSize: "0.9rem" }}
        >
          <option value="all">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "#7AA5CC" }}>
        Showing {visibleLeads.length} of {filtered.length.toLocaleString()} leads
      </div>

      {/* Leads grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "12px",
      }}>
        {visibleLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onStatusChange={(status) => setStatus(lead.id, status)}
            onClick={() => setSelectedLead(lead)}
          />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {visibleCount < filtered.length && (
        <div ref={sentinelRef} style={{ padding: "40px", textAlign: "center", color: "#7AA5CC" }}>
          Loading more...
        </div>
      )}

      {/* Detail modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} onStatusChange={(s) => { setStatus(selectedLead.id, s); setSelectedLead({ ...selectedLead, status: s }); }} />
      )}
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "4px",
      padding: "4px 10px", borderRadius: 20,
      background: `${color}15`, border: `1px solid ${color}40`,
      fontSize: "0.75rem", fontWeight: 600,
    }}>
      <span style={{ color }}>{count.toLocaleString()}</span>
      <span style={{ color: "#7AA5CC" }}>{label}</span>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem", fontWeight: 600,
        background: active ? "#22D3EE" : "#0F2147",
        color: active ? "#0A0F1C" : "#E6FBFF",
        border: active ? "1px solid #22D3EE" : "1px solid #22D3EE33",
        transition: "all 0.2s",
      }}
    >
      {label} {count > 0 && `(${count.toLocaleString()})`}
    </button>
  );
}

function LeadCard({ lead, onStatusChange, onClick }: { lead: Lead; onStatusChange: (s: Lead["status"]) => void; onClick: () => void }) {
  const statusColors: Record<string, string> = {
    pending: "#7AA5CC", accepted: "#10B981", rejected: "#EF4444", maybe: "#F59E0B",
  };
  const statusColor = statusColors[lead.status];

  return (
    <div
      onClick={onClick}
      style={{
        background: "#0F2147",
        borderRadius: 12,
        padding: "16px",
        border: lead.topPick ? "1px solid #F59E0B60" : "1px solid #22D3EE20",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(34,211,238,0.15)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Top pick badge */}
      {lead.isReal && (
        <div style={{
          position: "absolute", top: -8, left: 12,
          background: "#10B981", color: "#0A0F1C",
          fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px",
          borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          ✓ REAL VERIFIED
        </div>
      )}
      {lead.topPick && (
        <div style={{
          position: "absolute", top: -8, right: 12,
          background: "#F59E0B", color: "#0A0F1C",
          fontSize: "0.65rem", fontWeight: 800, padding: "2px 8px",
          borderRadius: 10, textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          ⭐ Top Pick
        </div>
      )}

      {/* Status dot */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor }} />
        <span style={{ fontSize: "0.7rem", color: "#7AA5CC", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {lead.type} • {lead.city}, {lead.country}
        </span>
      </div>

      {/* Name + rating */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#E6FBFF" }}>{lead.name}</h3>
        <div style={{ fontSize: "0.85rem", color: "#F59E0B", fontWeight: 600 }}>★ {lead.rating}</div>
      </div>

      {/* Description */}
      <p style={{ fontSize: "0.8rem", color: "#7AA5CC", margin: "0 0 8px 0", lineHeight: 1.4 }}>
        {lead.description}
      </p>

      {/* Revenue */}
      <div style={{ fontSize: "0.75rem", color: "#22D3EE", fontWeight: 600, marginBottom: "12px" }}>
        Est. Revenue: ${lead.estimatedRevenue.toLocaleString()}/yr
      </div>

      {/* Phone + WhatsApp */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <a
          href={`tel:${lead.phone.replace(/\s/g, "")}`}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            padding: "8px", borderRadius: 8, textDecoration: "none",
            background: "#22D3EE15", border: "1px solid #22D3EE40",
            color: "#22D3EE", fontSize: "0.8rem", fontWeight: 600,
          }}
        >
          📞 Call
        </a>
        <a
          href={`https://wa.me/${lead.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
            padding: "8px", borderRadius: 8, textDecoration: "none",
            background: "#25D36615", border: "1px solid #25D36640",
            color: "#25D366", fontSize: "0.8rem", fontWeight: 600,
          }}
        >
          💬 WhatsApp
        </a>
      </div>

      {/* Status buttons */}
      <div style={{ display: "flex", gap: "6px" }}>
        <StatusBtn active={lead.status === "accepted"} onClick={(e) => { e.stopPropagation(); onStatusChange("accepted"); }} label="✓" color="#10B981" />
        <StatusBtn active={lead.status === "maybe"} onClick={(e) => { e.stopPropagation(); onStatusChange("maybe"); }} label="?" color="#F59E0B" />
        <StatusBtn active={lead.status === "rejected"} onClick={(e) => { e.stopPropagation(); onStatusChange("rejected"); }} label="✗" color="#EF4444" />
        <StatusBtn active={lead.status === "pending"} onClick={(e) => { e.stopPropagation(); onStatusChange("pending"); }} label="—" color="#7AA5CC" />
      </div>
    </div>
  );
}

function StatusBtn({ active, onClick, label, color }: { active: boolean; onClick: (e: React.MouseEvent) => void; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "8px", borderRadius: 6, cursor: "pointer",
        background: active ? color : "transparent",
        color: active ? "#0A0F1C" : color,
        border: active ? `1px solid ${color}` : `1px solid ${color}40`,
        fontSize: "0.9rem", fontWeight: 700,
        transition: "all 0.2s",
      }}
    >
      {label}
    </button>
  );
}

function LeadModal({ lead, onClose, onStatusChange }: { lead: Lead; onClose: () => void; onStatusChange: (s: Lead["status"]) => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0F2147", borderRadius: 16, padding: "24px",
          maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto",
          border: "1px solid #22D3EE30",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            {lead.topPick && <div style={{ fontSize: "0.7rem", color: "#F59E0B", fontWeight: 700, marginBottom: "4px" }}>⭐ TOP PICK</div>}
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, margin: 0, color: "#E6FBFF" }}>{lead.name}</h2>
            <p style={{ fontSize: "0.85rem", color: "#7AA5CC", margin: "4px 0 0 0" }}>{lead.type} • {lead.city}, {lead.country}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#7AA5CC", fontSize: "1.5rem", cursor: "pointer", padding: "0 4px" }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "16px", flexWrap: "wrap" }}>
          <Info label="Rating" value={`★ ${lead.rating}`} />
          <Info label="Est. Revenue" value={`$${lead.estimatedRevenue.toLocaleString()}/yr`} />
          <Info label="Phone" value={lead.phone} />
        </div>

        <p style={{ fontSize: "0.9rem", color: "#E6FBFF", lineHeight: 1.5, marginBottom: "16px" }}>{lead.description}</p>

        <div style={{ fontSize: "0.85rem", color: "#7AA5CC", marginBottom: "16px" }}>
          <div style={{ marginBottom: "4px" }}>📧 {lead.email}</div>
          <div>📍 {lead.address}</div>
        </div>

        {/* Call + WhatsApp */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <a href={`tel:${lead.phone.replace(/\s/g, "")}`} style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: 8, textDecoration: "none", background: "#22D3EE", color: "#0A0F1C", fontWeight: 700, fontSize: "0.9rem" }}>
            📞 Call Now
          </a>
          <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", padding: "12px", borderRadius: 8, textDecoration: "none", background: "#25D366", color: "#0A0F1C", fontWeight: 700, fontSize: "0.9rem" }}>
            💬 WhatsApp
          </a>
        </div>

        {/* Status */}
        <div style={{ display: "flex", gap: "8px" }}>
          <StatusBtn active={lead.status === "accepted"} onClick={() => onStatusChange("accepted")} label="✓ Accept" color="#10B981" />
          <StatusBtn active={lead.status === "maybe"} onClick={() => onStatusChange("maybe")} label="? Maybe" color="#F59E0B" />
          <StatusBtn active={lead.status === "rejected"} onClick={() => onStatusChange("rejected")} label="✗ Reject" color="#EF4444" />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "0.7rem", color: "#7AA5CC", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#E6FBFF" }}>{value}</div>
    </div>
  );
}
