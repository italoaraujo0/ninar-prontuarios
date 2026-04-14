import React, { useState } from 'react';

const NinarProntuarios = () => {
  const [form, setForm] = useState({ paciente: '', solicitante: '', destino: '' });
  const [protocoloGerado, setProtocoloGerado] = useState(null);

  const handleRegistrar = () => {
    // Aqui você faria o POST para sua API
    if (form.paciente && form.solicitante) {
      const novoProtocolo = {
        id: Math.floor(Math.random() * 10000),
        data: new Date().toLocaleString(),
        ...form
      };
      setProtocoloGerado(novoProtocolo);
      alert("Movimentação registrada com sucesso!");
    }
  };

  const imprimirProtocolo = () => {
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <html>
        <head>
          <title>Protocolo de Entrega - Ninar</title>
          <style>
            body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; margin-bottom: 20px; }
            .info { margin-bottom: 30px; }
            .assinaturas { margin-top: 80px; display: flex; justify-content: space-around; }
            .campo-assinatura { text-align: center; width: 40%; }
            .linha { border-top: 1px solid #000; margin-bottom: 5px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ninar Prontuários</h1>
            <p>Protocolo de Movimentação #${protocoloGerado.id}</p>
          </div>
          
          <div class="info">
            <p><strong>Paciente:</strong> ${protocoloGerado.paciente}</p>
            <p><strong>Solicitante:</strong> ${protocoloGerado.solicitante}</p>
            <p><strong>Destino:</strong> ${protocoloGerado.destino}</p>
            <p><strong>Data/Hora:</strong> ${protocoloGerado.data}</p>
          </div>

          <div class="assinaturas">
            <div class="campo-assinatura">
              <div class="linha"></div>
              <p>Assinatura de Quem Recebeu</p>
            </div>
            <div class="campo-assinatura">
              <div class="linha"></div>
              <p>Responsável pela Entrega</p>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2c3e50', textAlign: 'center' }}>Ninar Prontuários</h2>
      
      {/* Campos de Input */}
      <input 
        placeholder="Nome do Paciente" 
        onChange={(e) => setForm({...form, paciente: e.target.value})}
        style={inputStyle} 
      />
      <input 
        placeholder="Nome de quem está pedindo" 
        onChange={(e) => setForm({...form, solicitante: e.target.value})}
        style={inputStyle} 
      />
      <input 
        placeholder="Médico / Destino" 
        onChange={(e) => setForm({...form, destino: e.target.value})}
        style={inputStyle} 
      />

      <button onClick={handleRegistrar} style={btnRegistrarStyle}>
        REGISTRAR MOVIMENTAÇÃO
      </button>

      {/* O BOTÃO QUE HAVIA SUMIDO - Renderização Condicional */}
      {protocoloGerado && (
        <button onClick={imprimirProtocolo} style={btnProtocoloStyle}>
          📄 GERAR PROTOCOLO (PDF)
        </button>
      )}
    </div>
  );
};

// Estilos Rápidos
const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' };
const btnRegistrarStyle = { width: '100%', padding: '15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const btnProtocoloStyle = { width: '100%', padding: '15px', marginTop: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };

export default NinarProntuarios;
