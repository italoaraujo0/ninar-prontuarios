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

  const criarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Preencha Nome e CNS/CPF!");
    await supabase.from("chamados").insert([{ ...form, status: "Pendente" }]);
    setForm({ nome: "", cpf: "", solicitante: "", profissional: "" });
    carregarDados();
  };

  const mudarStatus = async (id, novoStatus) => {
    await supabase.from("chamados").update({ status: novoStatus }).eq("id", id);
    carregarDados();
  };

  const deletarItem = async (id, nome) => {
    if (window.confirm(`Excluir prontuário de ${nome}?`)) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  // --- FUNCIONALIDADES DE FILTRO ---
  const chamadosFiltrados = chamados.filter(c => {
    if (!dataInicio && !dataFim) return true;
    const dataChamado = new Date(c.created_at);
    if (dataInicio && dataChamado < new Date(dataInicio)) return false;
    if (dataFim && dataChamado > new Date(dataFim + "T23:59:59")) return false;
    return true;
  });

  // --- ESTATÍSTICAS (RESUMO) ---
  const estatisticas = {
    total: chamadosFiltrados.length,
    pendentes: chamadosFiltrados.filter(c => c.status === "Pendente").length,
    atendidos: chamadosFiltrados.filter(c => c.status === "Atendido").length,
    devolvidos: chamadosFiltrados.filter(c => c.status === "Devolvido").length,
  };

  const gerarRelatorio = () => {
    const texto = chamadosFiltrados.map(c => 
      `${c.nome} | CNS: ${c.cpf} | Destino: ${c.profissional} | Status: ${c.status}`
    ).join("\n");
    alert("RELATÓRIO DE MOVIMENTAÇÃO:\n\n" + (texto || "Nenhum registro encontrado."));
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Ninar Prontuários</h1>
          <p style={styles.subtitle}>Gestão de Movimentação</p>
        </header>

        {/* FORMULÁRIO */}
        <section style={styles.cardForm}>
          <div style={styles.grid}>
            <input style={styles.input} value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome do Paciente" />
            <input style={styles.input} value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} placeholder="CNS ou CPF" />
            <input style={styles.input} value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} placeholder="Solicitante" />
            <input style={styles.input} value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} placeholder="Profissional Destino" />
          </div>
          <button style={styles.btnMain} onClick={criarChamado}>Cadastrar Chamado</button>
        </section>

        {/* FILTROS E RESUMO */}
        <div style={styles.filtrosArea}>
          <div style={styles.datas}>
            <input type="date" style={styles.inputDate} value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
            <input type="date" style={styles.inputDate} value={dataFim} onChange={e => setDataFim(e.target.value)} />
            <button style={styles.btnRelatorio} onClick={gerarRelatorio}>📄 Relatório</button>
          </div>
          <div style={styles.resumo}>
            <span>Total: <b>{estatisticas.total}</b></span>
            <span>Pendentes: <b style={{color: '#ff4d4f'}}>{estatisticas.pendentes}</b></span>
            <span>Devolvidos: <b style={{color: '#2ecc71'}}>{estatisticas.devolvidos}</b></span>
          </div>
        </div>

        {/* LISTA DE CARDS */}
        <div style={styles.listGrid}>
          {chamadosFiltrados.map(c => (
            <div key={c.id} style={{...styles.itemCard, borderTop: `5px solid ${c.status === 'Pendente' ? '#ff4d4f' : '#2ecc71'}`}}>
              <div style={styles.cardHeader}>
                <span style={styles.patientName}>{c.nome}</span>
                <button onClick={() => deletarItem(c.id, c.nome)} style={styles.btnDelete}>✕</button>
              </div>
              <p style={styles.info}><b>CNS:</b> {c.cpf}</p>
              <p style={styles.info}><b>Para:</b> {c.profissional}</p>
              <p style={styles.info}><b>Status:</b> {c.status}</p>
              
              <div style={styles.actions}>
                {c.status === "Pendente" ? (
                  <button style={styles.btnDeliver} onClick={() => mudarStatus(c.id, "Atendido")}>📦 Entregar</button>
                ) : (
                  <button style={styles.btnReturn} onClick={() => mudarStatus(c.id, "Devolvido")}>✔ Devolvido</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif', padding: '20px' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: { color: '#1a1a1a', margin: 0 },
  subtitle: { color: '#666' },
  cardForm: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd' },
  btnMain: { width: '100%', marginTop: '15px', padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  filtrosArea: { backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  datas: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  inputDate: { padding: '8px', borderRadius: '6px', border: '1px solid #ddd' },
  btnRelatorio: { padding: '8px 15px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  resumo: { display: 'flex', gap: '20px', fontSize: '0.9rem', borderTop: '1px solid #eee', paddingTop: '10px' },
  listGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' },
  itemCard: { backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  patientName: { fontWeight: 'bold', fontSize: '1.1rem' },
  btnDelete: { background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' },
  info: { fontSize: '0.85rem', margin: '5px 0', color: '#444' },
  actions: { marginTop: '15px', display: 'flex', gap: '10px' },
  btnDeliver: { flex: 1, padding: '10px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  btnReturn: { flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};
