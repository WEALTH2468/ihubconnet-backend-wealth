

const CatchErrorFunc = constrollerFunc => async(req, res, next) => {
    try {
        await constrollerFunc(req, res)
    }
    catch (err){
        next(err)
    }
};

module.exports = {CatchErrorFunc};