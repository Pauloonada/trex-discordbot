let inMaintenance = false;

export default{
    isMaintenance: () => inMaintenance,
    setMaintenance: (valor) =>{ inMaintenance = valor; }
};