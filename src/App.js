import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [form, setForm] = useState({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });

  const carregarDados = async () => {
    const { data } = await supabase.from("chamados").select("*").order("created_at", { ascending: false });
    setChamados(data || []);
  };

  useEffect(() => { 
    carregarDados();
    const interval = setInterval(carregarDados, 10000); // Atualiza a cada 10s para ver chamados novos
    return () => clearInterval(interval);
  }, []);

  const agora = () => new Date().toLocaleString('pt-BR');

  const salvarChamado = async (tipoManual) => {
    if (!form.nome) return alert("Nome do paciente é obrigatório!");
    const tipoFinal = tipoManual || form.tipo;
    const logInicial = [`${agora()} - [${tipoFinal}] Registrado por ${form.solicitante || 'Arquivo'}`];
    
    await supabase.from("chamados").insert([{ ...form, tipo: tipoFinal, status: "Pendente", logs: logInicial }]);
    setForm({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });
    carregarDados();
  };

  const atualizarStatus = async (id, novoStatus, logsAntigos) => {
    const novoLog = `${agora()} - Movimentação: ${novoStatus}`;
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

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#2c3e50", marginBottom: "5px" }}>Ninar Prontuários</h2>
          <div style={{ background: "#fff", display: "inline-block", padding: "5px 15px", borderRadius: "20px", fontSize: "12px", color: "#7f8c8d", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
            Controle de Fluxo em Tempo Real
          </div>
        </header>

        {/* ÁREA DE CADASTRO / SOLICITAÇÃO */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda do Dia</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe/Urgente</button>
          </div>
          
          <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{...s.input, flex: 1}} placeholder="Solicitante/Setor" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={{...s.input, flex: 1}} placeholder="Médico/Destino" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>
          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={() => salvarChamado()}>
            {form.tipo === "Agenda" ? "Lançar na Agenda" : "Abrir Chamado de Encaixe"}
          </button>
        </div>

        {/* LISTAGEM POR CATEGORIA */}
        <h4 style={{ color: "#34495e", borderBottom: "2px solid #ddd", paddingBottom: "5px" }}>Fluxo Atual</h4>
        
        {chamados.map(c => (
          <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${c.tipo === 'Encaixe' ? '#dc3545' : '#007bff'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <span style={{ fontSize: "10px", fontWeight: "bold", color: c.tipo === "Encaixe" ? "#dc3545" : "#007bff" }}>[{c.tipo.toUpperCase()}]</span>
                <br />
                <strong style={{ fontSize: "16px" }}>{c.nome}</strong>
              </div>
              <button onClick={() => deletarItem(c.id)} style={{ border: "none", background: "none", color: "#ccc", cursor: "pointer" }}>✕</button>
            </div>
            
            <div style={{ fontSize: "13px", color: "#555", margin: "8px 0" }}>
              <b>📍 Destino:</b> {c.profissional} <br/>
              <b>👤 Solicitante:</b> {c.solicitante}
            </div>

            <div style={s.logContainer}>
              <div style={{ fontSize: "10px", fontWeight: "bold", marginBottom: "4px" }}>RASTREIO:</div>
              {c.logs && c.logs.map((l, i) => <div key={i} style={s.logLine}>{l}</div>)}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              {c.status === "Pendente" && (
                <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Com o Profissional", c.logs)}>📦 Entregar</button>
              )}
              {c.status === "Com o Profissional" && (
                <button style={{...s.btnAction, background: "#28a745"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ Receber e Arquivar</button>
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
  input: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #dfe6e9", boxSizing: "border-box", fontSize: "14px" },
  btnMain: { width: "100%", padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", transition: "0.3s" },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  logContainer: { background: "#f8f9fa", padding: "10px", borderRadius: "8px", border: "1px solid #edf2f7" },
  logLine: { fontSize: "10px", color: "#636e72", borderBottom: "1px solid #f1f2f6", padding: "2px 0" },
  btnAction: { flex: 1, padding: "10px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }
};
