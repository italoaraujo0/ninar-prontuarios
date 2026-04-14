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
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, []);

  const agora = () => new Date().toLocaleString('pt-BR');

  const salvarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Nome e CNS/CPF são obrigatórios!");
    const logInicial = [`${agora()} - [${form.tipo}] Prontuário separado no Arquivo`];
    
    await supabase.from("chamados").insert([{ ...form, status: "No Arquivo (Separado)", logs: logInicial }]);
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
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>NINAR - PROTOCOLO DE RASTREIO</h2>
            <p>Gerado em: ${agora()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Paciente / CNS</th>
                <th>Médico/Destino</th>
                <th>Status Atual</th>
                <th>Rastreio Completo</th>
              </tr>
            </thead>
            <tbody>
              ${chamados.map(c => `
                <tr>
                  <td><b>${c.nome.toUpperCase()}</b><br>${c.cpf}</td>
                  <td>${c.profissional.toUpperCase()}</td>
                  <td>${c.status}</td>
                  <td class="log-cell">${c.logs ? c.logs.join('\n') : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px; width: 100%;">IMPRIMIR</button>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
  };

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Ninar Prontuários</h2>
          <button onClick={imprimirProtocolo} style={s.btnPrint}>📋 Protocolo</button>
        </div>

        {/* CADASTRO */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda do Dia</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
          </div>
          <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{...s.input, flex: 1}} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={{...s.input, flex: 1}} placeholder="Médico/Destino" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>
          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>Registrar Prontuário</button>
        </div>

        <h4 style={{ color: "#7f8c8d", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Painel de Guerrilha</h4>
        
        {chamados.map(c => (
          <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${c.status === 'Arquivado' ? '#bdc3c7' : (c.tipo === 'Encaixe' ? '#dc3545' : '#007bff')}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{fontSize: '15px'}}>{c.nome}</strong>
              <button onClick={() => deletarItem(c.id)} style={{ border: "none", background: "none", color: "#ccc" }}>✕</button>
            </div>
            <div style={{ fontSize: "12px", color: "#666", margin: "5px 0" }}>CNS: {c.cpf} | Destino: {c.profissional}</div>
            <div style={{ fontSize: "12px", fontWeight: "bold", color: "#2c3e50" }}>📍 Localização: {c.status}</div>
            
            {/* AQUI ESTÃO OS BOTÕES DE VOLTA */}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              {c.status.includes('Arquivo') && (
                <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entregue à Recepção", c.logs)}>📦 ENTREGAR</button>
              )}
              {c.status.includes('Recepção') && (
                <button style={{...s.btnAction, background: "#2ecc71"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ RECEBER / ARQUIVAR</button>
              )}
              {c.status === 'Arquivado' && (
                <span style={{fontSize: '11px', color: '#27ae60', fontWeight: 'bold'}}>✓ Finalizado e Guardado</span>
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
  btnMain: { width: "100%", padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  btnPrint: { padding: '8px 12px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px' },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  btnAction: { flex: 1, padding: "10px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }
};
