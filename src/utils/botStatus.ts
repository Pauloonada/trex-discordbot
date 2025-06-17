let inMaintenance = false;

export default{
    isMaintenance: () => inMaintenance,
    setMaintenance: (value: boolean) => { inMaintenance = value; }
};