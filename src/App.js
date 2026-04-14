import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configuração do seu banco de dados
const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [log, setLog] = useState([]);
  const [form, setForm] = useState({ nome: "", cpf: "", solicitante: "", profissional: "" });

  // Função para buscar os dados no Supabase
  const carregarDados = async () => {
    const { data } = await supabase
      .from("chamados")
      .select("*")
      .order("created_at", { ascending: false });
    setChamados(data || []);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Função para cadastrar novo prontuário
  const criarChamado = async () => {
    if (!form.nome || !form.cpf) {
      alert("Preencha pelo menos Nome e CPF!");
      return;
    }

    const { error } = await supabase.from("chamados").insert([
      { ...form, status: "Pendente" }
    ]);

    if (!error) {
      setLog([{ texto: `📢 ${new Date().toLocaleTimeString()} - Novo: ${form.nome}` }, ...log]);
      setForm({ nome: "", cpf: "", solicitante: "", profissional: "" });
      carregarDados();
    }
  };

  // Função para mudar o status (Entregar/Devolver)
  const mudarStatus = async (id, novoStatus, nome) => {
    const { error } = await supabase
      .from("chamados")
      .update({ status: novoStatus })
      .eq("id", id);

    if (!error) {
      setLog([{ texto: `🔄 ${new Date().toLocaleTimeString()} - ${nome} -> ${novoStatus}` }, ...log]);
      carregarDados();
    }
  };

  // Função para deletar
  const deletarItem = async (id, nome) => {
    if (window.confirm(`Excluir prontuário de ${nome}?`)) {
      const { error } = await supabase.from("chamados").delete().eq("id", id);
      if (!error) carregarDados();
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>Ninar Prontuários</h1>

        {/* Formulário */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input style={styles.input} placeholder="Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input style={styles.input} placeholder="CNS/CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            <input style={styles.input} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={styles.input} placeholder="Profissional" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          </div>
          <button style={styles.btnMain} onClick={criarChamado}>Cadastrar Movimentação</button>
        </div>

        {/* Lista de Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {chamados.map(c => (
            <div key={c.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '10px', borderTop: `4px solid ${c.status === 'Pendente' ? '#ff4d4f' : '#faad14'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{c.nome}</strong>
                <button onClick={() => deletarItem(c.id, c.nome)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ccc' }}>✕</button>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#666', margin: '5px 0' }}>Status: {c.status}</p>
              <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                {c.status === "Pendente" && (
                  <button style={styles.btnAction} onClick={() => mudarStatus(c.id, "Atendido", c.nome)}>📦 Entregar</button>
                )}
                {c.status === "Atendido" && (
                  <button style={{...styles.btnAction, backgroundColor: '#52c41a'}} onClick={() => mudarStatus(c.id, "Devolvido", c.nome)}>✔ Devolver</button>
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
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ddd' },
  btnMain: { width: '100%', marginTop: '10px', padding: '12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  btnAction: { flex: 1, padding: '8px', backgroundColor: '#faad14', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }
};
