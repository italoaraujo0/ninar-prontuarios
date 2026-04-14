import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [form, setForm] = useState({ nome: "", cpf: "", solicitante: "", profissional: "" });

  const carregarDados = async () => {
    const { data } = await supabase.from("chamados").select("*").order("created_at", { ascending: false });
    setChamados(data || []);
  };

  useEffect(() => { carregarDados(); }, []);

  const agora = () => new Date().toLocaleString('pt-BR');

  const criarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Campos obrigatórios!");
    const logInicial = [`${agora()} - Criado por ${form.solicitante}`];
    
    await supabase.from("chamados").insert([{ ...form, status: "Pendente", logs: logInicial }]);
    setForm({ nome: "", cpf: "", solicitante: "", profissional: "" });
    carregarDados();
  };

  const atualizarStatus = async (id, novoStatus, logsAntigos) => {
    const novoLog = `${agora()} - Status alterado para: ${novoStatus}`;
    const listaLogs = logsAntigos ? [...logsAntigos, novoLog] : [novoLog];

    await supabase.from("chamados").update({ 
      status: novoStatus, 
      logs: listaLogs 
    }).eq("id", id);
    
    carregarDados();
  };

  // FILTRO
  const chamadosFiltrados = chamados.filter(c => {
    if (!dataInicio && !dataFim) return true;
    const dataC = new Date(c.created_at);
    if (dataInicio && dataC < new Date(dataInicio)) return false;
    if (dataFim && dataC > new Date(dataFim + "T23:59:59")) return false;
    return true;
  });

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center" }}>📋 Ninar Prontuários</h2>

        {/* FORMULÁRIO */}
        <div style={s.card}>
          <input style={s.input} placeholder="Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS / CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <input style={s.input} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
          <input style={s.input} placeholder="Profissional" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          <button style={s.btnBlue} onClick={criarChamado}>CADASTRAR</button>
        </div>

        {/* LISTA COM RASTREIO */}
        {chamadosFiltrados.map(c => (
          <div key={c.id} style={{ ...s.card, borderLeft: `6px solid ${c.status === 'Pendente' ? '#ff4d4f' : '#2ecc71'}` }}>
            <strong>{c.nome}</strong> <br/>
            <small>CNS: {c.cpf} | Destino: {c.profissional}</small>
            
            <div style={s.logBox}>
              {c.logs && c.logs.map((l, i) => <div key={i} style={{fontSize: '10px', borderBottom: '1px solid #eee'}}>{l}</div>)}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {c.status === "Pendente" && (
                <button style={s.btnAction} onClick={() => atualizarStatus(c.id, "Atendido", c.logs)}>📦 ENTREGAR</button>
              )}
              {c.status === "Atendido" && (
                <button style={{...s.btnAction, background: '#2ecc71'}} onClick={() => atualizarStatus(c.id, "Devolvido", c.logs)}>✔ DEVOLVER</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  card: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" },
  input: { width: "100%", padding: "10px", marginBottom: "8px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" },
  btnBlue: { width: "100%", padding: "12px", background: "#007bff", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold" },
  btnAction: { flex: 1, padding: "10px", background: "#f39c12", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold" },
  logBox: { background: "#f8f9fa", padding: "8px", marginTop: "10px", borderRadius: "5px", maxHeight: "60px", overflowY: "auto" }
};
