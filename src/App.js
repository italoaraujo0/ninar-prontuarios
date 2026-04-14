import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [busca, setBusca] = useState("");
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
    if (!form.nome || !form.cpf || !form.solicitante) return alert("Preencha Nome, CNS e Quem está pedindo!");
    const logInicial = [`${agora()} - [${form.tipo}] Prontuário separado no Arquivo`];
    await supabase.from("chamados").insert([{ ...form, status: "No Arquivo (Separado)", logs: logInicial }]);
    setForm({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });
    carregarDados();
  };

  const atualizarStatus = async (id, novoStatus, logsAntigos) => {
    const novoLog = `${agora()} - ${novoStatus}`;
    const listaLogs = Array.isArray(logsAntigos) ? [...logsAntigos, novoLog] : [novoLog];
    await supabase.from("chamados").update({ status: novoStatus, logs: listaLogs }).eq("id", id);
    carregarDados();
  };

  const deletarItem = async (id) => {
    if (window.confirm("Excluir registro?")) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  const chamadosFiltrados = chamados.filter(c => {
    const termo = busca.toLowerCase();
    const dataBR = new Date(c.created_at).toLocaleDateString('pt-BR');
    return (
      c.nome?.toLowerCase().includes(termo) || 
      c.cpf?.includes(termo) || 
      dataBR.includes(termo) ||
      c.solicitante?.toLowerCase().includes(termo)
    );
  });

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "550px", margin: "0 auto" }}>
        
        <h2 style={{ color: "#2c3e50", textAlign: 'center' }}>Ninar Prontuários</h2>

        {/* FORMULÁRIO DE LANÇAMENTO */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
          </div>
          
          <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          
          {/* CAMPO DO NOME DA PESSOA QUE PEDIU - AGORA EM LINHA ÚNICA */}
          <input 
            style={{...s.input, border: '2px solid #f39c12'}} 
            placeholder="👤 Nome de quem está pedindo (Ex: Carlos)" 
            value={form.solicitante} 
            onChange={e => setForm({...form, solicitante: e.target.value})} 
          />

          <input style={s.input} placeholder="Médico / Destino" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />

          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>
            REGISTRAR MOVIMENTAÇÃO
          </button>
        </div>

        {/* BUSCA */}
        <input 
          style={{ ...s.input, border: '2px solid #2c3e50' }} 
          placeholder="🔎 Buscar (Nome, CNS ou Solicitante)..." 
          value={busca} 
          onChange={e => setBusca(e.target.value)} 
        />

        {/* LISTA DE CARDS */}
        {chamadosFiltrados.filter(c => busca !== "" || c.status !== "Arquivado").map(c => {
          const st = c.status ? c.status.toLowerCase() : "";
          return (
            <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${st.includes('arquivado') ? '#bdc3c7' : (c.tipo === 'Encaixe' ? '#dc3545' : '#007bff')}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{fontSize: '16px'}}>{c.nome}</strong>
                <button onClick={() => deletarItem(c.id)} style={{ border: "none", background: "none", color: "#ccc" }}>✕</button>
              </div>
              
              <div style={{ fontSize: "13px", color: "#d35400", fontWeight: 'bold', marginTop: '5px' }}>
                👤 Solicitado por: {c.solicitante ? c.solicitante.toUpperCase() : "Não informado"}
              </div>
              
              <div style={{ fontSize: "12px", color: "#666" }}>
                📍 Destino: {c.profissional} | CNS: {c.cpf}
              </div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                {(st.includes('arquivo') || st === "") && (
                  <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entregue na Recepção", c.logs)}>📦 ENTREGAR</button>
                )}
                {st.includes('recepção') && (
                  <button style={{...s.btnAction, background: "#2ecc71"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ ARQUIVAR</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  card: { background: "#fff", padding: "15px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "20px" },
  tab: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "bold" },
  input: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "14px" },
  btnMain: { width: "100%", padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  btnAction: { flex: 1, padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "13px" }
};
