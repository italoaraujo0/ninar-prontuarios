import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [form, setForm] = useState({ nome: "", cpf: "", solicitante: "", profissional: "" });

  const carregarDados = async () => {
    const { data: chamadosData } = await supabase.from("chamados").select("*").order("created_at", { ascending: false });
    setChamados(chamadosData || []);
  };

  useEffect(() => { carregarDados(); }, []);

  const criarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Preencha Nome e CNS/CPF!");
    const logMsg = `📋 Criado: ${form.nome} por ${form.solicitante}`;
    
    const { error } = await supabase.from("chamados").insert([
      { ...form, status: "Pendente", logs: [logMsg] }
    ]);

    if (!error) {
      setForm({ nome: "", cpf: "", solicitante: "", profissional: "" });
      carregarDados();
    }
  };

  const mudarStatus = async (id, novoStatus, nomeAtual) => {
    const hora = new Date().toLocaleTimeString();
    const acao = novoStatus === "Atendido" ? "📦 ENTREGUE" : "✔ DEVOLVIDO";
    const novoLog = `${acao} em ${hora}`;

    // Busca logs antigos e adiciona o novo
    const item = chamados.find(c => c.id === id);
    const logsAtualizados = item.logs ? [...item.logs, novoLog] : [novoLog];

    await supabase.from("chamados").update({ 
      status: novoStatus, 
      logs: logsAtualizados 
    }).eq("id", id);
    
    carregarDados();
  };

  const deletarItem = async (id, nome) => {
    if (window.confirm(`Excluir tudo de ${nome}?`)) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  return (
    <div style={s.body}>
      <div style={s.container}>
        <h1 style={s.title}>Ninar Prontuários</h1>
        
        {/* FORMULÁRIO */}
        <div style={s.card}>
          <div style={s.grid}>
            <input style={s.input} placeholder="Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            <input style={s.input} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={s.input} placeholder="Destino Profissional" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>
          <button style={s.btnMain} onClick={criarChamado}>Cadastrar Movimentação</button>
        </div>

        {/* LISTA */}
        <div style={s.listGrid}>
          {chamados.map(c => (
            <div key={c.id} style={{...s.itemCard, borderLeft: `6px solid ${c.status === 'Pendente' ? '#ff4d4f' : '#2ecc71'}`}}>
              <div style={s.cardHeader}>
                <strong>{c.nome}</strong>
                <button onClick={() => deletarItem(c.id, c.nome)} style={s.btnDel}>✕</button>
              </div>
              <p style={s.info}><b>CNS:</b> {c.cpf} | <b>Destino:</b> {c.profissional}</p>
              
              <div style={s.logBox}>
                <small><b>RASTREIO:</b></small>
                {c.logs && c.logs.map((l, i) => <div key={i} style={s.logItem}>{l}</div>)}
              </div>

              <div style={s.actions}>
                {c.status === "Pendente" ? (
                  <button style={s.btnGo} onClick={() => mudarStatus(c.id, "Atendido", c.nome)}>📦 Entregar</button>
                ) : (
                  <button style={s.btnCheck} onClick={() => mudarStatus(c.id, "Devolvido", c.nome)}>✔ Devolvido</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  body: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' },
  container: { maxWidth: '800px', margin: '0 auto' },
  title: { textAlign: 'center', color: '#333' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
  btnMain: { width: '100%', marginTop: '15px', padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  listGrid: { display: 'grid', gap: '15px' },
  itemCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between' },
  info: { fontSize: '0.9rem', color: '#666', margin: '10px 0' },
  logBox: { backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px', margin: '10px 0', fontSize: '0.8rem' },
  logItem: { borderBottom: '1px solid #eee', padding: '2px 0' },
  btnDel: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' },
  actions: { display: 'flex', gap: '10px' },
  btnGo: { flex: 1, padding: '10px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnCheck: { flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }
};
