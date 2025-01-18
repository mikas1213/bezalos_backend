const generateArray = length => {
    const today = new Date();
    return Array.from({ length: length }, (_, index) => {
        const modifiedDate = new Date(today);
        modifiedDate.setDate(today.getDate() - index * 7); // Subtract weeks
        return {
            svoris: null,
            bicepsas: null,
            talija: null,
            sedmenys: null,
            slaunis: null,
            apimtys: null,
            created_at: null,
            w_week_start: modifiedDate.toISOString(), 
            ud_week_start: null
        };
    });
}

module.exports = generateArray;