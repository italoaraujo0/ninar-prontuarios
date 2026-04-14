import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState({ nome: "", cpf: "", profissional: "" });

  const carregarDados = async () => {
    const { data } = await supabase.from("chamados").select("*").order("id", { ascending: false });
    setChamados(data || []);
  };

  useEffect(() => { 
    carregarDados();
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, []);

  const salvarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Preencha Nome e CNS!");
    
    // Salva apenas o que existe no seu banco conforme o print
    const { error } = await supabase.from("chamados").insert([{ 
      nome: form.nome,
      cpf: form.cpf,
      profissional: form.profissional,
      status: "Pendente" 
    }]);

    if (error) alert("Erro ao salvar: " + error.message);
    setForm({ nome: "", cpf: "", profissional: "" });
    carregarDados();
  };

  const atualizarStatus = async (id, novoStatus) => {
    await supabase.from("chamados").update({ status: novoStatus }).eq("id", id);
    carregarDados();
  };

  const deletarItem = async (id) => {
    if (window.confirm("Excluir registro?")) {
      await supabase.from("chamados").delete().eq("id", id);
      carregarDados();
    }
  };

  const filtrar = chamados.filter(c => 
    (c.nome && c.nome.toLowerCase().includes(busca.toLowerCase())) || 
    (c.cpf && c.cpf.includes(busca))
  );

  return (
    <div style={{ background: "#f0f2f5", minHeight: "100vh", padding: "10px", fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        
        <h2 style={{textAlign: 'center', color: '#1a73e8'}}>Ninar Arquivo</h2>

        {/* CADASTRO SIMPLES */}
        <div style={{background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '15px'}}>
          <input style={s.input} placeholder="Nome do Paciente" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} />
          <input style={s.input} placeholder="CNS ou CPF" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} />
          <input style={s.input} placeholder="Médico / Destino" value={form.profissional} onChange={e => setForm({...form, profissional: e.target.value})} />
          <button onClick={salvarChamado} style={{width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}>REGISTRAR</button>
        </div>

        {/* BUSCA */}
        <input 
          style={{...s.input, border: '2px solid #1a73e8'}} 
          placeholder="🔎 Buscar por nome ou CNS..." 
          value={busca} 
          onChange={e => setBusca(e.target.value)} 
        />

        {/* LISTA DE CARDS */}
        {filtrar.map(c => {
          // Lógica simplificada: Se não for "Arquivado", mostra os botões
          const st = c.status ? c.status.toLowerCase() : "";

          return (
            <div key={c.id} style={{background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '10px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <strong>{c.nome}</strong>
                <button onClick={() => deletarItem(c.id)} style={{background: 'none', border: 'none', color: '#ccc'}}>✕</button>
              </div>
              <div style={{fontSize: '12px', color: '#666'}}>CNS: {c.cpf} | Destino: {c.profissional}</div>
              <div style={{fontSize: '13px', fontWeight: 'bold', marginTop: '8px', color: '#1a73e8'}}>Status: {c.status || "Pendente"}</div>

              <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                {/* BOTÃO 1: Se estiver Pendente ou Vazio, mostra ENTREGAR */}
                {(st === "pendente" || st === "") && (
                  <button 
                    onClick={() => atualizarStatus(c.id, "Entregue")}
                    style={{flex: 1, padding: '12px', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}
                  >📦 ENTREGAR</button>
                )}

                {/* BOTÃO 2: Se estiver Entregue, mostra ARQUIVAR */}
                {st === "entregue" && (
                  <button 
                    onClick={() => atualizarStatus(c.id, "Arquivado")}
                    style={{flex: 1, padding: '12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold'}}
                  >✔ ARQUIVAR</button>
                )}
              </div>
              
              {st === "arquivado" && (
                <div style={{marginTop: '10px', textAlign: 'center', color: '#2ecc71', fontSize: '12px', fontWeight: 'bold'}}>✓ Finalizado</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  input: { width: '100%', padding: '12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }
};
