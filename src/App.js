const EstiloAssinatura = {
  marginTop: '50px',
  display: 'flex',
  justifyContent: 'space-around'
};

const CampoAssinatura = () => (
  <div style={EstiloAssinatura}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ borderTop: '1px solid #000', width: '200px' }}></div>
      <p>Assinatura do Solicitante</p>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ borderTop: '1px solid #000', width: '200px' }}></div>
      <p>Responsável (Arquivo)</p>
    </div>
  </div>
);
