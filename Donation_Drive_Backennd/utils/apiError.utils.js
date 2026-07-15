// THIS IS THE UTILITY CREATED FOR THE API ERROR RESPONSES HERE WE WILL USE ERROR CLASS OF JS AND TRY TO BUILD CUSTOM ERROR MESSAGES 
//THIS APIERROR UTIL ALSO CAN BE USED FOR THE VALIDATION JUST USE IN YOUR CODE APIERROR.ASSERT(CONDITION,ERROR MESSAGE)
class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
    static assert(condition, message, statusCode = 400) {
        if (!condition) {
            throw new ApiError(statusCode, message);
        }
    }
    static notFound(resource, message = "Resource not found") {
    if (!resource) {
        throw new ApiError(404, message);
    }
}

    static unauthorized(message = "Unauthorized") {
        throw new ApiError(401, message);
    }

    static forbidden(message = "Forbidden") {
        throw new ApiError(403, message);
    }

    static conflict(message = "Conflict") {
        throw new ApiError(409, message);
    }
}

export {ApiError}