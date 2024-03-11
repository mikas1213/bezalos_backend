exports.getHomepage = async (req, res) => {
    console.log('Hello from Home page!')
    res.status(200).json({
        status: 'success',
        message: 'Homepage'
    });
};

exports.getVirtuve = async (req, res) => {
    console.log('Hello from Virtuve page!')
    res.status(200).json({
        status: 'success',
        message: 'Virtuve'
    });
};
  