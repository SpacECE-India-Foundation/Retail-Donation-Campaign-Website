//THIS API RESPONSE UTILITY IS CREATED TO FOLLOW THE CONSISTENT API REPONSE PATTERN IN ENTIREE SYSTEM
class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export { ApiResponse }