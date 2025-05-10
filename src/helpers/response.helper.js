"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHelper = void 0;
const responseHelper = ({ data, message = '', error, statusCode = 200, }) => {
    return {
        data,
        message,
        error,
        statusCode,
    };
};
exports.responseHelper = responseHelper;
//# sourceMappingURL=response.helper.js.map