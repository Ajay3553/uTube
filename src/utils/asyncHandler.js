
/* Higher order functions
const f = () = () => {} // f is functin that passes in another function for evaluation
in this we have another function as async function wating for the response if received then passed into fn
*/

/* One method is using Try Catch
const asyncHandler = (fn) = async(req, res, next) => { // creating a wrapper function for async funtions that checks it
    try{
        await fn(req, res, next)
    }
    catch (e) {
        res.status(e.code || 500).json({
            success : false,
            message : e.message
        })
    }
}
*/


const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((e) => next(e))
    }
}

export {asyncHandler}