import mongoose from 'mongoose';
import { tokenValidation } from '../utils/jwtUtils.js';
import { ERROR_NAME } from '../types/errorTypes.js';
import { HTTP_CODE } from '../types/httpCodes.js';
import User from '../models/userModel.js';
export const jwtMiddleware = async (req, _res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return next({
            name: ERROR_NAME.UNAUTHORIZED_ERROR,
            message: 'Unauthorized',
            statusNumber: HTTP_CODE.UNAUTHORIZED,
        });
    }
    const result = tokenValidation(token);
    if (!result.valid || !result.payload) {
        return next({
            name: ERROR_NAME.UNAUTHORIZED_ERROR,
            message: 'Unauthorized',
            statusNumber: HTTP_CODE.UNAUTHORIZED,
        });
    }
    const id = new mongoose.Types.ObjectId(result.payload.id);
    const user = await User.findById(id).select({ password: 0 });
    if (!user) {
        return next({
            name: ERROR_NAME.UNAUTHORIZED_ERROR,
            message: 'Unauthorized',
            statusNumber: HTTP_CODE.UNAUTHORIZED,
        });
    }
    req.userId = user._id;
    req.solvedCtf = user.solvedCtf;
    next();
};
//# sourceMappingURL=jwtMiddleware.js.map