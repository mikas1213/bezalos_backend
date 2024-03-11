exports.getHomepage = async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Homepage'
    });
};

exports.getVirtuve = async (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Virtuve'
    });
};
  