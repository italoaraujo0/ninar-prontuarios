import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [busca, setBusca] = useState("");
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [form, setForm] = useState({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });

  const carregarDados = async () => {
    const { data } = await supabase.from("chamados").select("*").order("created_at", { ascending: false });
    setChamados(data || []);
  };

  useEffect(() => { 
    carregarDados();
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, []);

  const agora = () => new Date().toLocaleString('pt-BR');

  const salvarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Nome e CNS/CPF são obrigatórios!");
    const logInicial = [`${agora()} - [${form.tipo}] Prontuário separado no Arquivo`];
    await supabase.from("chamados").insert([{ ...form, status: "No Arquivo", logs: logInicial }]);
    setForm({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });
    carregarDados();
  };

  const atualizarStatus = async (id, novoStatus, logsAntigos) => {
    const novoLog = `${agora()} - ${novoStatus}`;
    const listaLogs = logsAntigos ? [...logsAntigos, novoLog] : [novoLog];
    await supabase.from("chamados").update({ status: novoStatus, logs: listaLogs }).eq("id", id);
    carregarDados();
  };

  const deletarItem = async (id) => {
    if (window.confirm("Remover este registro?")) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  // Filtro para a tela principal (Geralmente o que não foi arquivado ainda ou busca recente)
  const chamadosFiltrados = chamados.filter(c => 
    (c.nome.toLowerCase().includes(busca.toLowerCase()) || c.cpf.includes(busca))
  );

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "550px", margin: "0 auto" }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Ninar Prontuários</h2>
          <div style={{display: 'flex', gap: '5px'}}>
             <button onClick={() => setMostrarHistorico(!mostrarHistorico)} style={s.btnHist}>🔍 {mostrarHistorico ? "Fechar" : "Histórico"}</button>
          </div>
        </header>

        {/* ÁREA DE LANÇAMENTO (Só aparece se não estiver no modo histórico) */}
        {!mostrarHistorico && (
          <div style={s.card}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda</button>
              <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
            </div>
            <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={{...s.input, flex: 1}} placeholder="Setor" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
              <input style={{...s.input, flex: 1}} placeholder="Médico" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
            </div>
            <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>
               Lançar Prontuário
            </button>
          </div>
        )}

        {/* BARRA DE BUSCA GLOBAL */}
        <div style={{ marginBottom: '15px' }}>
          <input 
            style={{ ...s.input, border: '2px solid #2c3e50', marginBottom: 0 }} 
            placeholder="🔎 Buscar em TODO o histórico..." 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>

        <h4 style={{ color: "#7f8c8d" }}>{mostrarHistorico ? "📜 Todo o Caminho Percorrido" : "🚀 Fluxo Ativo"}</h4>
        
        {chamadosFiltrados.map(c => (
          <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${c.status.includes('Arquivado') ? '#bdc3c7' : (c.tipo === 'Encaixe' ? '#dc3545' : '#007bff')}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{fontSize: '16px'}}>{c.nome}</strong>
              <button onClick={() => deletarItem(c.id)} style={{ border: "none", background: "none", color: "#ccc" }}>✕</button>
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>CNS: {c.cpf} | Médico: {c.profissional}</div>
            
            {/* LINHA DO TEMPO / RASTREIO */}
            <div style={s.logBox}>
              <div style={{fontSize: '10px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px'}}>CAMINHO PERCORRIDO:</div>
              {c.logs && c.logs.map((l, i) => (
                <div key={i} style={{fontSize: '10px', color: '#555', padding: '2px 0', borderBottom: '1px solid #eee'}}>
                  {l}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              {c.status === "No Arquivo" && (
                <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entregue na Recepção", c.logs)}>📦 ENTREGAR</button>
              )}
              {c.status === "Entregue na Recepção" && (
                <button style={{...s.btnAction, background: "#2ecc71"}} onClick={() => atualizarStatus(c.id, "Arquivado no Arquivo Central", c.logs)}>✔ RECEBER / ARQUIVAR</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: { background: "#fff", padding: "15px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "20px" },
  tab: { flex: 1, padding: "8px", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  input: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #dfe6e9", boxSizing: "border-box", fontSize: "14px", outline: 'none' },
  btnMain: { width: "100%", padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  btnHist: { padding: '8px 12px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  btnAction: { flex: 1, padding: "10px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" },
  logBox: { background: "#f8f9fa", padding: "10px", borderRadius: "8px", marginTop: "10px", border: "1px solid #eee" }
};
