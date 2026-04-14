import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
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

  const deletarItem = async (id) => {
    if (window.confirm("Excluir registro?")) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '15px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#1a1a1a' }}>Ninar Prontuários</h2>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input style={s.input} placeholder="Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
            <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
            <input style={s.input} placeholder="Solicitante" value={form.solicitante} onChange={e => setForm({...form, solicitante: e.target.value})} />
            <input style={s.input} placeholder="Destino Profissional" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
            <button style={s.btnMain} onClick={criarChamado}>CADASTRAR</button>
          </div>
        </div>

        {chamados.map(c => (
          <div key={c.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '15px', borderLeft: `6px solid ${c.status === 'Pendente' ? '#ff4d4f' : '#2ecc71'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{c.nome}</strong>
              <button onClick={() => deletarItem(c.id)} style={{ border: 'none', background: 'none', color: '#ccc' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', margin: '8px 0', color: '#555' }}>
              <b>CNS:</b> {c.cpf} | <b>Destino:</b> {c.profissional}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>Status: {c.status}</p>
            <div style={{ marginTop: '10px' }}>
              {c.status === "Pendente" ? (
                <button style={s.btnDeliver} onClick={() => mudarStatus(c.id, "Atendido")}>📦 ENTREGAR</button>
              ) : (
                <button style={s.btnReturn} onClick={() => mudarStatus(c.id, "Devolvido")}>✔ DEVOLVIDO</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' },
  btnMain: { padding: '15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' },
  btnDeliver: { width: '100%', padding: '12px', backgroundColor: '#f39c12', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  btnReturn: { width: '100%', padding: '12px', backgroundColor: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }
};
