import React, { useState, useEffect } from 'react';

// Estilos mantendo o padrão visual do seu print
const styles = {
  container: { padding: '20px', maxWidth: '450px', margin: 'auto', fontFamily: 'sans-serif', backgroundColor: '#f4f7f6', minHeight: '100vh' },
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' },
  input: { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' },
  btnRegistrar: { width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '10px' },
  btnProtocolo: { width: '100%', padding: '15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' },
  itemLista: { borderLeft: '5px solid #007bff', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', position: 'relative', marginTop: '15px' }
};

export default function NinarApp() {
  const [dados, setDados] = useState({ paciente: '', documento: '', solicitante: '', destino: '' });
  const [lista, setLista] = useState([]);
  const [registroAtivo, setRegistroAtivo] = useState(null);

  // Função para registrar (o que alimenta a lista e gera o protocolo)
  const registrarMovimentacao = () => {
    if (!dados.paciente || !dados.solicitante) {
      alert("Por favor, preencha o nome do paciente e do solicitante.");
      return;
    }

    const novoRegistro = {
      id: Math.floor(Math.random() * 90000) + 10000,
      data: new Date().toLocaleString('pt-BR'),
      ...dados
    };

    setLista([novoRegistro, ...lista]);
    setRegistroAtivo(novoRegistro); // Define este como o ativo para o botão de protocolo aparecer
    setDados({ paciente: '', documento: '', solicitante: '', destino: '' }); // Limpa campos
  };

  // FUNÇÃO DE IMPRESSÃO COM CAMPOS DE ASSINATURA
  const gerarPDF = (item) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Protocolo - Ninar Prontuários</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #007bff; margin-bottom: 30px; padding-bottom: 10px; }
            .content { font-size: 18px; margin-bottom: 50px; }
            .content p { margin: 15px 0; }
            .footer-assinaturas { margin-top: 100px; display: flex; justify-content: space-between; }
            .assinatura-box { text-align: center; width: 45%; }
            .linha { border-top: 1px solid #000; margin-bottom: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NINAR PRONTUÁRIOS</h1>
            <h3>Protocolo de Movimentação #${item.id}</h3>
          </div>
          <div class="content">
            <p><strong>Paciente:</strong> ${item.paciente}</p>
            <p><strong>Documento/SNC:</strong> ${item.documento}</p>
            <p><strong>Solicitado por:</strong> ${item.solicitante}</p>
            <p><strong>Destino:</strong> ${item.destino}</p>
            <p><strong>Data de Saída:</strong> ${item.data}</p>
          </div>
          
          <div class="footer-assinaturas">
            <div class="assinatura-box">
              <div class="linha"></div>
              <p>Assinatura do Solicitante<br/><small>(Quem recebe o prontuário)</small></p>
            </div>
            <div class="assinatura-box">
              <div class="linha"></div>
              <p>Responsável Técnico<br/><small>(Setor de Arquivo)</small></p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={styles.container}>
      <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>Ninar Prontuários</h1>
      
      <div style={styles.card}>
        <input style={styles.input} placeholder="Nome do Paciente" value={dados.paciente} onChange={e => setDados({...dados, paciente: e.target.value})} />
        <input style={styles.input} placeholder="SNC ou CPF" value={dados.documento} onChange={e => setDados({...dados, documento: e.target.value})} />
        <input style={styles.input} placeholder="Nome de quem está pedindo" value={dados.solicitante} onChange={e => setDados({...dados, solicitante: e.target.value})} />
        <input style={styles.input} placeholder="Médico / Destino" value={dados.destino} onChange={e => setDados({...dados, destino: e.target.value})} />
        
        <button style={styles.btnRegistrar} onClick={registrarMovimentacao}>REGISTRAR MOVIMENTAÇÃO</button>
        
        {/* BOTÃO QUE VOLTOU: Só aparece se houver um registro ativo ou se você selecionar um na lista */}
        {registroAtivo && (
          <button style={styles.btnProtocolo} onClick={() => gerarPDF(registroAtivo)}>
            📄 GERAR PROTOCOLO ÚLTIMO REGISTRO
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        {lista.map((item) => (
          <div key={item.id} style={styles.itemLista} onClick={() => setRegistroAtivo(item)}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.paciente}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              👤 Solicitado por: <strong>{item.solicitante}</strong><br/>
              📍 Destino: {item.destino}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); gerarPDF(item); }} 
              style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #28a745', color: '#28a745', background: 'none' }}
            >
              Imprimir Protocolo
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
