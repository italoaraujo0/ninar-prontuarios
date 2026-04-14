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
    if (!form.nome) return alert("Nome do paciente é obrigatório!");
    const logInicial = [`${agora()} - [${form.tipo}] Registrado`];
    await supabase.from("chamados").insert([{ ...form, status: "Pendente", logs: logInicial }]);
    setForm({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });
    carregarDados();
  };

  const atualizarStatus = async (id, novoStatus, logsAntigos) => {
    const novoLog = `${agora()} - ${novoStatus}`;
    const listaLogs = logsAntigos ? [...logsAntigos, novoLog] : [novoLog];
    await supabase.from("chamados").update({ status: novoStatus, logs: listaLogs }).eq("id", id);
    carregarDados();
  };

  // --- FUNÇÃO DE IMPRESSÃO DE PROTOCOLO ---
  const imprimirProtocolo = () => {
    const conteudo = chamados.filter(c => c.status !== "Arquivado");
    
    const janelaImpressao = window.open('', '', 'width=800,height=600');
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Protocolo de Entrega - NINAR</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-around; }
            .assinatura { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px; font-size: 12px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>INSTITUTO ACQUA - NINAR</h2>
            <h3>PROTOCOLO DE MOVIMENTAÇÃO DE PRONTUÁRIOS</h3>
            <p>Data: ${new Date().toLocaleDateString()} - Hora: ${new Date().toLocaleTimeString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CNS/CPF</th>
                <th>Médico/Destino</th>
                <th>Tipo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${conteudo.map(c => `
                <tr>
                  <td>${c.nome}</td>
                  <td>${c.cpf}</td>
                  <td>${c.profissional}</td>
                  <td>${c.tipo}</td>
                  <td>${c.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div class="assinatura">Arquivo (Saída)<br/>Ítalo Cássio</div>
            <div class="assinatura">Recepção (Recebido)<br/>Assinatura / Carimbo</div>
          </div>
          <br>
          <button class="no-print" onclick="window.print()">Confirmar Impressão</button>
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
          <button onClick={imprimirProtocolo} style={s.btnPrint}>📄 Gerar Protocolo</button>
        </div>

        {/* FORMULÁRIO */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
          </div>
          <input style={s.input} placeholder="Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS / CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{...s.input, flex: 1}} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={{...s.input, flex: 1}} placeholder="Médico" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>
          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>
            Lançar no Sistema
          </button>
        </div>

        {/* LISTA */}
        {chamados.filter(c => c.status !== "Arquivado").map(c => (
          <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${c.tipo === 'Encaixe' ? '#dc3545' : '#007bff'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{c.nome}</strong>
              <span style={{ fontSize: '10px', color: '#999' }}>{c.tipo}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#555", margin: "5px 0" }}>Médico: {c.profissional} | Setor: {c.solicitante}</p>
            
            <div style={s.logContainer}>
              {c.logs && c.logs.slice(-2).map((l, i) => <div key={i} style={{fontSize: '9px'}}>{l}</div>)}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {c.status === "Pendente" && (
                <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entregue à Recepção", c.logs)}>📦 Entregar</button>
              )}
              {c.status === "Entregue à Recepção" && (
                <button style={{...s.btnAction, background: "#28a745"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ Confirmar Devolução</button>
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
  btnPrint: { padding: '8px 12px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  itemCard: { background: "#fff", padding: "12px", borderRadius: "12px", marginBottom: "10px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  logContainer: { background: "#f8f9fa", padding: "8px", borderRadius: "6px" },
  btnAction: { flex: 1, padding: "10px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }
};
