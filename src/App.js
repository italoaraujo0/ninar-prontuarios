// ... (mantenha o topo igual, com a conexão do Supabase)

  // --- FUNÇÃO DE IMPRESSÃO PARA ANEXAR À ATA ---
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
                  <th>Paciente (Prontuário)</th>
                  <th>Destino (Médico/Setor)</th>
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
            <p style="font-size: 9px; text-align: center; margin-top: 20px;">
              Documento gerado digitalmente pelo Sistema de Gestão de Prontuários Ninar.
            </p>
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

// ... (o restante do componente App() e estilos s continuam iguais)
