/* PROJETO: NINAR PRONTUÁRIOS v1.2
  AUTOR: ÍTALO CÁSSIO COSTA DE ARAÚJO
  CONTATO: italocassio@gmail.com
  
  AVISO LEGAL: Propriedade Intelectual Privada. Este software foi desenvolvido de 
  forma independente, em ambiente privado e fora do horário de expediente. 
  
  ESTADO ATUAL: CEDIDO PARA USO TEMPORÁRIO E AUTORIZADO. 
  O autor reserva-se o direito de revogar o acesso ou alterar os termos de uso 
  a qualquer momento. Todos os direitos reservados © 2026.
*/

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configuração do Banco de Dados (Supabase)
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
    if (!form.nome || !form.cpf || !form.solicitante) return alert("Preencha Nome, CNS e Solicitante!");
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
    if (window.confirm("Deseja excluir este registro permanentemente?")) {
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

  const imprimirProtocolo = () => {
    const janelaImpressao = window.open('', '', 'width=900,height=700');
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Protocolo de Entrega - NINAR</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 11px; }
            th { background: #f2f2f2; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .footer-assinaturas { margin-top: 60px; display: flex; justify-content: space-between; }
            .box-assinatura { border-top: 1px solid #000; width: 40%; text-align: center; padding-top: 8px; font-size: 12px; font-weight: bold; }
            .log-cell { font-size: 9px; color: #666; white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0">INSTITUTO ACQUA - NINAR</h1>
            <h2 style="margin:5px 0">PROTOCOLO DE MOVIMENTAÇÃO DE PRONTUÁRIOS</h2>
            <p>Data de Emissão: ${agora()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Paciente / CNS</th>
                <th>Solicitante / Médico</th>
                <th>Status Atual</th>
                <th>Histórico de Rastreio</th>
              </tr>
            </thead>
            <tbody>
              ${chamadosFiltrados.map(c => `
                <tr>
                  <td><b>${c.nome.toUpperCase()}</b><br>${c.cpf}</td>
                  <td>SOLIC: ${c.solicitante.toUpperCase()}<br>MED: ${c.profissional}</td>
                  <td>${c.status}</td>
                  <td class="log-cell">${c.logs ? c.logs.join('\n') : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer-assinaturas">
            <div class="box-assinatura">ARQUIVO (SAÍDA)<br/><small>Assinatura / Carimbo</small></div>
            <div class="box-assinatura">RECEPÇÃO (RECEBIDO)<br/><small>Assinatura / Carimbo</small></div>
          </div>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif", display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: "550px", margin: "0 auto", flex: 1, width: '100%' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Ninar Prontuários</h2>
          <button onClick={imprimirProtocolo} style={s.btnPrint}>📋 Protocolo</button>
        </header>

        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
          </div>
          <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <input style={{...s.input, border: '2px solid #f39c12'}} placeholder="👤 Nome de quem está pedindo" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
          <input style={s.input} placeholder="Médico / Destino" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>REGISTRAR MOVIMENTAÇÃO</button>
        </div>

        <input style={{ ...s.input, border: '2px solid #2c3e50' }} placeholder="🔎 Pesquisar..." value={busca} onChange={e => setBusca(e.target.value)} />

        {chamadosFiltrados.filter(c => busca !== "" || c.status !== "Arquivado").map(c => {
          const st = c.status ? c.status.toLowerCase() : "";
          return (
            <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${st.includes('arquivado') ? '#bdc3c7' : (c.tipo === 'Encaixe' ? '#dc3545' : '#007bff')}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{fontSize: '16px'}}>{c.nome}</strong>
                <button onClick={() => deletarItem(c.id)} style={{ border: "none", background: "none", color: "#ccc", cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ fontSize: "13px", color: "#d35400", fontWeight: 'bold', marginTop: '5px' }}>👤 Solicitado por: {c.solicitante?.toUpperCase()}</div>
              <div style={{ fontSize: "12px", color: "#666", marginTop: '3px' }}>📍 Destino: {c.profissional} | CNS: {c.cpf}</div>
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                {(st.includes('arquivo') || st === "" || st.includes('pendente')) && st !== 'arquivado' && (
                  <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entrada na Recepção", c.logs)}>📦 ENTREGAR</button>
                )}
                {st.includes('recepção') && (
                  <button style={{...s.btnAction, background: "#2ecc71"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ ARQUIVAR</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <footer style={{ 
        textAlign: 'center', 
        padding: '25px', 
        fontSize: '10px', 
        color: '#bdc3c7', 
        fontWeight: 'bold', 
        letterSpacing: '1px', 
        textTransform: 'uppercase',
        lineHeight: '1.5'
      }}>
        Desenvolvido por Ítalo Cássio Costa de Araújo <br/>
        © 2026 • Todos os direitos reservados
      </footer>
    </div>
  );
}

const s = {
  card: { background: "#fff", padding: "15px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "20px" },
  tab: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", cursor: 'pointer' },
  input: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "14px", outline: 'none' },
  btnMain: { width: "100%", padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: 'pointer' },
  btnPrint: { padding: '10px 15px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "15px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  btnAction: { flex: 1, padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", cursor: 'pointer' }
};
