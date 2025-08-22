"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.ReviewsController = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/reviews/reviews.controller.ts
var common_1 = require("@nestjs/common");
var microservices_1 = require("@nestjs/microservices");
var map_exception_1 = require("./utils/map-exception");
var ReviewsController = /** @class */ (function () {
    function ReviewsController(reviewsService) {
        this.reviewsService = reviewsService;
        this.logger = new common_1.Logger(ReviewsController_1.name);
    }
    ReviewsController_1 = ReviewsController;
    ReviewsController.prototype.createReview = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, createReviewDto, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = data.userId, createReviewDto = __rest(data, ["userId"]);
                        return [4 /*yield*/, this.reviewsService.createReview(userId, createReviewDto)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Review created successfully',
                                data: result
                            }];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error creating review:', error_1.message);
                        throw map_exception_1.mapException(error_1);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsController.prototype.addComment = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, createCommentDto, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = data.userId, createCommentDto = __rest(data, ["userId"]);
                        return [4 /*yield*/, this.reviewsService.addComment(userId, createCommentDto)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                status: 201,
                                message: 'Comment added successfully',
                                data: result
                            }];
                    case 2:
                        error_2 = _a.sent();
                        this.logger.error('Error adding comment:', error_2.message);
                        throw map_exception_1.mapException(error_2);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsController.prototype.getProductReviews = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var productId, _a, page, _b, limit, result, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        productId = data.productId, _a = data.page, page = _a === void 0 ? 1 : _a, _b = data.limit, limit = _b === void 0 ? 10 : _b;
                        return [4 /*yield*/, this.reviewsService.getProductReviews(productId, page, limit)];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Product reviews retrieved successfully',
                                data: result
                            }];
                    case 2:
                        error_3 = _c.sent();
                        this.logger.error('Error getting product reviews:', error_3.message);
                        throw map_exception_1.mapException(error_3);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsController.prototype.canReview = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reviewsService.canUserReview(data.userId, data.productId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Review permission checked',
                                data: { canReview: result }
                            }];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error('Error checking review permission:', error_4.message);
                        throw map_exception_1.mapException(error_4);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsController.prototype.getUserReviews = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, _a, page, _b, limit, result, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = data.userId, _a = data.page, page = _a === void 0 ? 1 : _a, _b = data.limit, limit = _b === void 0 ? 10 : _b;
                        return [4 /*yield*/, this.reviewsService.getUserReviews(userId, page, limit)];
                    case 1:
                        result = _c.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'User reviews retrieved successfully',
                                data: result
                            }];
                    case 2:
                        error_5 = _c.sent();
                        this.logger.error('Error getting user reviews:', error_5.message);
                        throw map_exception_1.mapException(error_5);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsController.prototype.deleteComment = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reviewsService.deleteComment(data.userId, data.commentId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                status: 200,
                                message: 'Comment deleted successfully',
                                data: null
                            }];
                    case 2:
                        error_6 = _a.sent();
                        this.logger.error('Error deleting comment:', error_6.message);
                        throw map_exception_1.mapException(error_6);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    var ReviewsController_1;
    __decorate([
        microservices_1.MessagePattern('create_review'),
        __param(0, microservices_1.Payload())
    ], ReviewsController.prototype, "createReview");
    __decorate([
        microservices_1.MessagePattern('add_comment'),
        __param(0, microservices_1.Payload())
    ], ReviewsController.prototype, "addComment");
    __decorate([
        microservices_1.MessagePattern('get_product_reviews'),
        __param(0, microservices_1.Payload())
    ], ReviewsController.prototype, "getProductReviews");
    __decorate([
        microservices_1.MessagePattern('can_user_review'),
        __param(0, microservices_1.Payload())
    ], ReviewsController.prototype, "canReview");
    __decorate([
        microservices_1.MessagePattern('get_user_reviews'),
        __param(0, microservices_1.Payload())
    ], ReviewsController.prototype, "getUserReviews");
    __decorate([
        microservices_1.MessagePattern('delete_comment'),
        __param(0, microservices_1.Payload())
    ], ReviewsController.prototype, "deleteComment");
    ReviewsController = ReviewsController_1 = __decorate([
        common_1.Controller()
    ], ReviewsController);
    return ReviewsController;
}());
exports.ReviewsController = ReviewsController;
