let inMaintenance = false;

export default{
    isInMaintenance: () => inMaintenance,
    setMaintenance: (value: boolean) => { inMaintenance = value; }
};