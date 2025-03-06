/**
 * Middleware funkcija, kuri pagauna asinchronines klaidas
 * ir perduoda jas toliau į centralizuotą klaidų apdorojimą
 * 
 * @param {Function} fn - Asinchroninė kontrolerio funkcija
 * @returns {Function} Express middleware
 */

module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};