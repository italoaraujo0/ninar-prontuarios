import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://vyteblkicfeqodyfiiqo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dGVibGtpY2ZlcW9keWZpaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTE5NzAsImV4cCI6MjA5MTY4Nzk3MH0.slj913xmbI0HcBZDQe2davRsLdlcN_oguasP8ZCaUYQ"
);

export default function App() {
  const [chamados, setChamados] = useState([]);
  const [log, setLog] = useState([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    solicitante: "",
    profissional: "",
  });

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

  const criarChamado = async () => {
    if (!form.nome || !form.cpf) return alert("Preencha Nome e CNS/CPF!");
    const { error } = await supabase
      .from("chamados")
      .insert([{ ...form, status: "Pendente" }]);
    if (!error) {
      setLog([
        {
          texto: `📢 ${new Date().toLocaleTimeString()} - Novo chamado: ${
            form.nome
          }`,
        },
        ...log,
      ]);
      setForm({ nome: "", cpf: "", solicitante: "", profissional: "" });
      carregarDados();
    }
  };

  const mudarStatus = async (id, novoStatus, nome) => {
    const { error } = await supabase
      .from("chamados")
      .update({ status: novoStatus })
      .eq("id", id);
    if (!error) {
      setLog([
        {
          texto: `🔄 ${new Date().toLocaleTimeString()} - ${nome} movido para ${novoStatus}`,
        },
        ...log,
      ]);
      carregarDados();
    }
  };

  // NOVA FUNÇÃO PARA DELETAR
  const deletarItem = async (id, nome) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o prontuário de ${nome}?`)
    ) {
      const { error } = await supabase.from("chamados").delete().eq("id", id);
      if (!error) {
        setLog([
          {
            texto: `🗑️ ${new Date().toLocaleTimeString()} - Excluído: ${nome}`,
          },
          ...log,
        ]);
        carregarDados();
      } else {
        alert("Erro ao deletar: " + error.message);
      }
    }
  };

  const chamadosFiltrados = chamados.filter((c) => {
    if (!dataInicio && !dataFim) return true;
    const d = new Date(c.created_at);
    if (dataInicio && d < new Date(dataInicio)) return false;
    if (dataFim && d > new Date(dataFim + "T23:59:59")) return false;
    return true;
  });

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.mainTitle}>Ninar Prontuários</h1>
          <p style={styles.tagline}>Gestão de movimentação de documentos</p>
        </header>

        {/* BOX DE CADASTRO */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Novo Registro</h2>
          <div style={styles.formGrid}>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>Paciente</label>
              <input
                style={styles.input}
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>CNS ou CPF</label>
              <input
                style={styles.input}
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: e.target.value })}
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>Quem solicitou?</label>
              <input
                style={styles.input}
                placeholder="Setor ou nome"
                value={form.solicitante}
                onChange={(e) =>
                  setForm({ ...form, solicitante: e.target.value })
                }
              />
            </div>
            <div style={styles.inputWrapper}>
              <label style={styles.label}>Profissional Destino</label>
              <input
                style={styles.input}
                placeholder="Médico/Terapeuta"
                value={form.profissional}
                onChange={(e) =>
                  setForm({ ...form, profissional: e.target.value })
                }
              />
            </div>
          </div>
          <button style={styles.mainButton} onClick={criarChamado}>
            Cadastrar Movimentação
          </button>
        </section>

        {/* FILTROS E RESUMO */}
        <section style={styles.filterSection}>
          <div style={styles.filterGroup}>
            <input
              type="date"
              style={styles.dateInput}
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
            <span style={{ color: "#999" }}>até</span>
            <input
              type="date"
              style={styles.dateInput}
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
          <div style={styles.resumoRow}>
            <span>
              Total: <b>{chamadosFiltrados.length}</b>
            </span>
          </div>
        </section>

        {/* LISTA DE CARDS */}
        <div style={styles.listContainer}>
          {chamadosFiltrados.map((c) => (
            <div
              key={c.id}
              style={{
                ...styles.card,
                borderTop: `4px solid ${getStatusColor(c.status)}`,
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.patientName}>{c.nome}</span>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(c.status),
                    }}
                  >
                    {c.status}
                  </span>
                  {/* BOTÃO DE DELETAR */}
                  <button
                    onClick={() => deletarItem(c.id, c.nome)}
                    style={styles.btnDeleteIcon}
                    title="Excluir registro"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div style={styles.cardBody}>
                <p style={styles.cardText}>
                  <b>ID:</b> {c.cpf}
                </p>
                <p style={styles.cardText}>
                  <b>Destino:</b> {c.profissional}
                </p>
                <p style={styles.cardText}>
                  <b>Origem:</b> {c.solicitante}
                </p>
              </div>
              <div style={styles.cardActions}>
                {c.status === "Pendente" && (
                  <button
                    style={styles.btnDeliver}
                    onClick={() => mudarStatus(c.id, "Atendido", c.nome)}
                  >
                    📦 Entregar Documento
                  </button>
                )}
                {c.status === "Atendido" && (
                  <>
                    <button
                      style={styles.btnReturn}
                      onClick={() => mudarStatus(c.id, "Devolvido", c.nome)}
                    >
                      ✔ Devolvido
                    </button>
                    <button
                      style={styles.btnAlert}
                      onClick={() => mudarStatus(c.id, "Não devolvido", c.nome)}
                    >
                      ❗ Alerta
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* LOGS */}
        <div style={styles.logSection}>
          <h3 style={styles.logTitle}>Histórico Local</h3>
          <div style={styles.logBox}>
            {log.map((l, i) => (
              <div key={i} style={styles.logItem}>
                {l.texto}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const getStatusColor = (s) => {
  if (s === "Pendente") return "#ff4d4f";
  if (s === "Atendido") return "#faad14";
  if (s === "Devolvido") return "#52c41a";
  return "#8c8c8c";
};

const styles = {
  // ... (estilos anteriores mantidos)
  body: {
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  container: { maxWidth: "1000px", margin: "0 auto", padding: "20px" },
  header: { textAlign: "center", marginBottom: "30px" },
  mainTitle: { margin: 0, color: "#1a1a1a", fontSize: "1.8rem" },
  tagline: { color: "#666", marginTop: "5px" },
  section: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  sectionTitle: { fontSize: "1.1rem", marginBottom: "15px", color: "#333" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  inputWrapper: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "0.85rem", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },
  mainButton: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  filterSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "20px",
  },
  filterGroup: { display: "flex", gap: "8px", alignItems: "center" },
  dateInput: { padding: "8px", borderRadius: "6px", border: "1px solid #ddd" },
  resumoRow: { fontSize: "0.9rem", color: "#444" },
  listContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "15px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    alignItems: "flex-start",
  },
  patientName: {
    fontWeight: "700",
    fontSize: "1rem",
    color: "#1a1a1a",
    flex: 1,
    paddingRight: "10px",
  },
  statusBadge: {
    fontSize: "0.7rem",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: "12px",
    fontWeight: "bold",
  },

  // ESTILO DO BOTÃO DE DELETAR
  btnDeleteIcon: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ccc",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    padding: "0 5px",
    transition: "color 0.2s",
  },
  // Para o efeito de hover, em JS puro fazemos assim:

  cardBody: { fontSize: "0.85rem", color: "#555", marginBottom: "15px" },
  cardText: { margin: "3px 0" },
  cardActions: { display: "flex", gap: "8px", marginTop: "auto" },
  btnDeliver: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#faad14",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.8rem",
  },
  btnReturn: {
    flex: 1,
    padding: "8px",
    backgroundColor: "#52c41a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.8rem",
  },
  btnAlert: {
    padding: "8px",
    backgroundColor: "#ff4d4f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logSection: { marginTop: "30px" },
  logTitle: { fontSize: "1rem", color: "#333" },
  logBox: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "10px",
    height: "120px",
    overflowY: "auto",
    fontSize: "0.8rem",
    color: "#777",
    border: "1px solid #eee",
  },
  logItem: { padding: "4px 0", borderBottom: "1px solid #f9f9f9" },
};
