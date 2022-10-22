class AppSuccess extends onSuccess {
    constructor(message, statusCode) {
        super(message);


        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('2') ? 'Sucesss' : 'Okay';
        this.isOperational = true;


        onSuccess.captureStackTrace(this, this.constructor);
    }
}


module.exports = AppSuccess;