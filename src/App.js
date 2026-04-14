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
    if (!form.nome || !form.cpf) return alert("Nome e CNS/CPF são obrigatórios!");
    const logInicial = [`${agora()} - Separado no Arquivo` ];
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

  // LÓGICA DE FILTRAGEM:
  // Se houver busca, procura em TUDO. Se não, mostra só o que não foi arquivado ainda.
  const chamadosExibidos = chamados.filter(c => {
    const termo = busca.toLowerCase();
    const matchBusca = c.nome.toLowerCase().includes(termo) || c.cpf.includes(termo);
    
    if (busca.length > 0) return matchBusca; // Busca Global
    return c.status !== "Arquivado"; // Fluxo do Dia
  });

  const imprimirProtocolo = () => {
    const janelaImpressao = window.open('', '', 'width=900,height=700');
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Protocolo de Rastreio - NINAR</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; font-size: 11px; }
            th { background: #f2f2f2; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .log-cell { font-size: 9px; color: #666; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>NINAR - PROTOCOLO HISTÓRICO DE RASTREIO</h2>
            <p>Gerado em: ${agora()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Paciente / CNS-CPF</th>
                <th>Médico/Destino</th>
                <th>Status Atual</th>
                <th>Logs de Passagem</th>
              </tr>
            </thead>
            <tbody>
              ${chamadosExibidos.map(c => `
                <tr>
                  <td><b>${c.nome.toUpperCase()}</b><br>${c.cpf}</td>
                  <td>${c.profissional.toUpperCase()}</td>
                  <td>${c.status.toUpperCase()}</td>
                  <td class="log-cell">${c.logs ? c.logs.join('\n') : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p style="margin-top: 20px; font-size: 10px;">* Registros extraídos do banco de dados permanente.</p>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "550px", margin: "0 auto" }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Ninar Prontuários</h2>
          <button onClick={imprimirProtocolo} style={s.btnPrint}>📋 Protocolo</button>
        </header>

        {/* CADASTRO */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
          </div>
          <input style={s.input} placeholder="Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS / CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{...s.input, flex: 1}} placeholder="Setor" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={{...s.input, flex: 1}} placeholder="Médico" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>
          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>Registrar Movimentação</button>
        </div>

        {/* BUSCA */}
        <div style={{ marginBottom: '15px' }}>
          <input 
            style={{ ...s.input, border: '2px solid #2c3e50', marginBottom: 0 }} 
            placeholder="🔎 Buscar em todo o histórico..." 
            value={busca} 
            onChange={e => setBusca(e.target.value)} 
          />
        </div>

        <h4 style={{ color: "#7f8c8d" }}>
          {busca.length > 0 ? "Resultados da Pesquisa" : "Prontuários em Circulação"}
        </h4>
        
        {chamadosExibidos.map(c => (
          <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${c.status === 'Arquivado' ? '#bdc3c7' : (c.tipo === 'Encaixe' ? '#dc3545' : '#007bff')}` }}>
            <strong style={{fontSize: '16px'}}>{c.nome}</strong>
            <div style={{ fontSize: "12px", color: "#666" }}>CNS: {c.cpf} | Destino: {c.profissional}</div>
            
            <div style={s.logBox}>
              <div style={{fontSize: '9px', fontWeight: 'bold', color: '#999'}}>RASTREIO:</div>
              {c.logs && c.logs.map((l, i) => (
                <div key={i} style={{fontSize: '10px', color: '#555'}}>{l}</div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              {c.status === "No Arquivo" && (
                <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entregue na Recepção", c.logs)}>📦 ENTREGAR</button>
              )}
              {c.status === "Entregue na Recepção" && (
                <button style={{...s.btnAction, background: "#2ecc71"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ VOLTOU / ARQUIVAR</button>
              )}
              {c.status === "Arquivado" && (
                <div style={{fontSize: '11px', color: '#27ae60', fontWeight: 'bold'}}>✓ Este prontuário já foi arquivado.</div>
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
  btnPrint: { padding: '8px 12px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  btnAction: { flex: 1, padding: "12px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" },
  logBox: { background: "#f8f9fa", padding: "8px", borderRadius: "8px", marginTop: "10px", border: "1px solid #eee" }
};
