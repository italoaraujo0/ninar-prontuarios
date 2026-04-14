import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configuração do Supabase (Sua chave e URL)
const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [form, setForm] = useState({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });

  // Carrega os dados do banco
  const carregarDados = async () => {
    const { data } = await supabase.from("chamados").select("*").order("created_at", { ascending: false });
    setChamados(data || []);
  };

  useEffect(() => { 
    carregarDados();
    const interval = setInterval(carregarDados, 10000); // Atualiza a cada 10s para ver novos encaixes
    return () => clearInterval(interval);
  }, []);

  const agora = () => new Date().toLocaleString('pt-BR');

  // Salva novo prontuário (Agenda ou Encaixe)
  const salvarChamado = async () => {
    if (!form.nome) return alert("O nome do paciente é obrigatório!");
    const logInicial = [`${agora()} - [${form.tipo}] Prontuário separado` ];
    
    const { error } = await supabase.from("chamados").insert([{ 
      ...form, 
      status: "Pendente", 
      logs: logInicial 
    }]);

    if (!error) {
      setForm({ nome: "", cpf: "", solicitante: "", profissional: "", tipo: "Agenda" });
      carregarDados();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  };

  // Atualiza movimentação (Entregar / Devolver)
  const atualizarStatus = async (id, novoStatus, logsAntigos) => {
    const novoLog = `${agora()} - ${novoStatus}`;
    const listaLogs = logsAntigos ? [...logsAntigos, novoLog] : [novoLog];
    
    await supabase.from("chamados").update({ 
      status: novoStatus, 
      logs: listaLogs 
    }).eq("id", id);
    
    carregarDados();
  };

  const deletarItem = async (id) => {
    if (window.confirm("Deseja excluir este registro do sistema?")) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  // FUNÇÃO DE IMPRESSÃO PARA ANEXAR À ATA
  const imprimirProtocolo = () => {
    const conteudo = chamados.filter(c => c.status !== "Arquivado");
    
    const janelaImpressao = window.open('', '', 'width=800,height=600');
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Ata de Movimentação - NINAR</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 10px; }
            .container { border: 1px dashed #000; padding: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 5px; text-align: left; font-size: 11px; }
            .header { text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; }
            .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 11px; }
            .box-assinatura { border-top: 1px solid #000; width: 45%; text-align: center; padding-top: 5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <strong>PROTOCOLO DE MOVIMENTAÇÃO - ARQUIVO NINAR</strong><br/>
              <small>Data: ${new Date().toLocaleDateString()} | Via única para anexo em Ata</small>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Qtd</th>
                  <th>Paciente</th>
                  <th>Médico/Destino</th>
                  <th>Tipo</th>
                </tr>
              </thead>
              <tbody>
                ${conteudo.map((c, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${c.nome.toUpperCase()}</td>
                    <td>${c.profissional.toUpperCase()}</td>
                    <td>${c.tipo === 'Encaixe' ? '⚠️ ENCAIXE' : 'AGENDA'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              <div class="box-assinatura">Responsável Arquivo<br/>(Saída)</div>
              <div class="box-assinatura">Responsável Recepção<br/>(Recebido)</div>
            </div>
          </div>
          <br>
          <button class="no-print" onclick="window.print()" style="padding: 10px; width: 100%; cursor: pointer;">
            🖨️ IMPRIMIR PARA ANEXAR À ATA
          </button>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
  };

  return (
    <div style={{ background: "#f4f7f6", minHeight: "100vh", padding: "15px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: "#2c3e50", margin: 0 }}>Ninar Prontuários</h2>
          <button onClick={imprimirProtocolo} style={s.btnPrint}>📄 Ata</button>
        </div>

        {/* ÁREA DE LANÇAMENTO */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => setForm({...form, tipo: "Agenda"})} style={{...s.tab, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#eee", color: form.tipo === "Agenda" ? "#fff" : "#666"}}>Agenda</button>
            <button onClick={() => setForm({...form, tipo: "Encaixe"})} style={{...s.tab, backgroundColor: form.tipo === "Encaixe" ? "#dc3545" : "#eee", color: form.tipo === "Encaixe" ? "#fff" : "#666"}}>⚠️ Encaixe</button>
          </div>
          
          <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS / CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{...s.input, flex: 1}} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={{...s.input, flex: 1}} placeholder="Profissional" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>

          <button style={{...s.btnMain, backgroundColor: form.tipo === "Agenda" ? "#007bff" : "#dc3545"}} onClick={salvarChamado}>
            {form.tipo === "Agenda" ? "Lançar Agenda" : "Solicitar Encaixe"}
          </button>
        </div>

        {/* LISTAGEM ATIVA */}
        <h4 style={{ color: "#7f8c8d", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>Movimentação Ativa</h4>
        
        {chamados.filter(c => c.status !== "Arquivado").map(c => (
          <div key={c.id} style={{ ...s.itemCard, borderLeft: `6px solid ${c.tipo === 'Encaixe' ? '#dc3545' : '#007bff'}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <strong style={{ fontSize: "16px", color: "#2d3436" }}>{c.nome}</strong>
                <div style={{ fontSize: "11px", color: "#95a5a6" }}>CNS: {c.cpf}</div>
              </div>
              <button onClick={() => deletarItem(c.id)} style={{ border: "none", background: "none", color: "#dfe6e9", cursor: "pointer" }}>✕</button>
            </div>
            
            <div style={{ fontSize: "13px", color: "#636e72", margin: "10px 0" }}>
              <b>👨‍⚕️ Destino:</b> {c.profissional} <br/>
              <b>📢 Solicitante:</b> {c.solicitante}
            </div>

            <div style={s.logContainer}>
              <div style={{fontSize: '9px', fontWeight: 'bold', color: '#b2bec3', marginBottom: '3px'}}>HISTÓRICO:</div>
              {c.logs && c.logs.map((l, i) => <div key={i} style={s.logLine}>{l}</div>)}
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              {c.status === "Pendente" ? (
                <button style={{...s.btnAction, background: "#f39c12"}} onClick={() => atualizarStatus(c.id, "Entregue à Recepção", c.logs)}>📦 ENTREGAR</button>
              ) : (
                <button style={{...s.btnAction, background: "#2ecc71"}} onClick={() => atualizarStatus(c.id, "Arquivado", c.logs)}>✔ VOLTOU PARA O ARQUIVO</button>
              )}
            </div>
          </div>
        ))}

        {chamados.filter(c => c.status !== "Arquivado").length === 0 && (
          <div style={{textAlign: 'center', color: '#ccc', marginTop: '30px'}}>Nenhum prontuário em circulação.</div>
        )}
      </div>
    </div>
  );
}

const s = {
  card: { background: "#fff", padding: "15px", borderRadius: "15px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", marginBottom: "20px" },
  tab: { flex: 1, padding: "8px", border: "none", borderRadius: "8px", fontSize: "11px", fontWeight: "bold", cursor: "pointer" },
  input: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #dfe6e9", boxSizing: "border-box", fontSize: "14px", outline: 'none' },
  btnMain: { width: "100%", padding: "15px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
  btnPrint: { padding: '8px 15px', background: '#34495e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  itemCard: { background: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" },
  logContainer: { background: "#f8f9fa", padding: "8px", borderRadius: "8px", border: "1px solid #edf2f7" },
  logLine: { fontSize: "10px", color: "#636e72", borderBottom: "1px solid #f1f2f6", padding: "2px 0" },
  btnAction: { flex: 1, padding: "12px", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }
};
