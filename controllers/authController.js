const db = require('../database/db');

const myFunc = async () => {
    const data = await db.query('SELECT * FROM users where id = $1', ['25481804-9ce4-4b6f-9702-041c854a13ff']);
    console.log(data.rows[0]);
};
myFunc();

exports.signup = async (req, res) => {
    try {
        const data = await db.query('SELECT * FROM users where id = $1', ['25481804-9ce4-4b6f-9702-041c854a13ff']);
        
        res.status(200).json({
            status: 'success',
            data: data.rows
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.login = async (req, res) => {
    try {
        // const data = await db.query('SELECT * FROM users where id = $1', ['25481804-9ce4-4b6f-9702-041c854a13ff']);
        
        res.status(200).json({
            status: 'success',
            data: 'hello from login'
        });
    } catch (err) {
        console.log(err.message);
    }
};

exports.test = async (req, res, next) => {
    try {
        // const data = await db.query('SELECT * FROM users where id = $1', ['25481804-9ce4-4b6f-9702-041c854a13ff']);
        console.log('test test test')
        // res.status(200).json({
        //     status: 'success',
        //     data: 'test test test'
        // });
        next();
    } catch (err) {
        console.log(err.message);
    }
};


// exports.getHomepage = async (req, res) => {
    
//     res.status(200).json({
//         status: 'success',
//         message: 'Homepage'
//     });
// };

// exports.getVirtuve = async (req, res) => {
    
//     res.status(200).json({
//         status: 'success',
//         message: 'Virtuve'
//     });
// };
  