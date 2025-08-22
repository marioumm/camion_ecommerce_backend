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
exports.__esModule = true;
exports.ReviewsService = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var rxjs_1 = require("rxjs");
var review_entity_1 = require("./entities/review.entity");
var comment_entity_1 = require("./entities/comment.entity");
var map_exception_1 = require("./utils/map-exception");
var ReviewsService = /** @class */ (function () {
    function ReviewsService(reviewRepository, commentRepository, ordersClient, buckyDropService) {
        this.reviewRepository = reviewRepository;
        this.commentRepository = commentRepository;
        this.ordersClient = ordersClient;
        this.buckyDropService = buckyDropService;
        this.logger = new common_1.Logger(ReviewsService_1.name);
    }
    ReviewsService_1 = ReviewsService;
    ReviewsService.prototype.createReview = function (userId, createReviewDto) {
        return __awaiter(this, void 0, void 0, function () {
            var woocommerceProductId, orderId, rating, comment, product, order, hasProduct, existingReview, newReview, savedReview, reviewComment, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        woocommerceProductId = createReviewDto.woocommerceProductId, orderId = createReviewDto.orderId, rating = createReviewDto.rating, comment = createReviewDto.comment;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, this.buckyDropService.getProduct(woocommerceProductId)];
                    case 2:
                        product = _a.sent();
                        if (!product) {
                            throw new common_1.NotFoundException('Product not found');
                        }
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.ordersClient.send('get_order_with_items', { orderId: orderId, userId: userId }))];
                    case 3:
                        order = _a.sent();
                        if (!order || !order.isDelivered) {
                            throw new common_1.ForbiddenException('You cannot review this product - order not delivered yet');
                        }
                        hasProduct = order.items.some(function (item) { return item.woocommerceProductId === woocommerceProductId; });
                        if (!hasProduct) {
                            throw new common_1.ForbiddenException('You did not purchase this product');
                        }
                        return [4 /*yield*/, this.reviewRepository.findOne({
                                where: { userId: userId, woocommerceProductId: woocommerceProductId, orderId: orderId }
                            })];
                    case 4:
                        existingReview = _a.sent();
                        if (existingReview) {
                            throw new common_1.ForbiddenException('You have already reviewed this product');
                        }
                        newReview = this.reviewRepository.create({
                            userId: userId,
                            woocommerceProductId: woocommerceProductId,
                            orderId: orderId,
                            rating: rating,
                            productName: product.name,
                            productSlug: product.slug,
                            isVerifiedPurchase: true
                        });
                        return [4 /*yield*/, this.reviewRepository.save(newReview)];
                    case 5:
                        savedReview = _a.sent();
                        if (!(comment && comment.trim())) return [3 /*break*/, 7];
                        reviewComment = this.commentRepository.create({
                            userId: userId,
                            reviewId: savedReview.id,
                            comment: comment.trim()
                        });
                        return [4 /*yield*/, this.commentRepository.save(reviewComment)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        this.ordersClient.emit('review_created', {
                            orderId: orderId,
                            productId: woocommerceProductId,
                            rating: rating
                        });
                        return [4 /*yield*/, this.reviewRepository.findOne({
                                where: { id: savedReview.id },
                                relations: ['comments']
                            })];
                    case 8: return [2 /*return*/, _a.sent()];
                    case 9:
                        error_1 = _a.sent();
                        this.logger.error('Error creating review:', error_1.message);
                        throw map_exception_1.mapException(error_1);
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsService.prototype.addComment = function (userId, createCommentDto) {
        return __awaiter(this, void 0, void 0, function () {
            var reviewId, comment, review, newComment, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reviewId = createCommentDto.reviewId, comment = createCommentDto.comment;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.reviewRepository.findOne({
                                where: { id: reviewId },
                                relations: ['comments']
                            })];
                    case 2:
                        review = _a.sent();
                        if (!review) {
                            throw new common_1.NotFoundException('Review not found');
                        }
                        newComment = this.commentRepository.create({
                            userId: userId,
                            reviewId: reviewId,
                            comment: comment.trim()
                        });
                        return [4 /*yield*/, this.commentRepository.save(newComment)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_2 = _a.sent();
                        this.logger.error('Error adding comment:', error_2.message);
                        throw map_exception_1.mapException(error_2);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsService.prototype.getProductReviews = function (woocommerceProductId, page, limit) {
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, reviews, total, result, ratingDistribution, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.reviewRepository.findAndCount({
                                where: { woocommerceProductId: woocommerceProductId, isActive: true },
                                relations: ['comments'],
                                order: { createdAt: 'DESC' },
                                skip: (page - 1) * limit,
                                take: limit
                            })];
                    case 1:
                        _a = _b.sent(), reviews = _a[0], total = _a[1];
                        return [4 /*yield*/, this.reviewRepository
                                .createQueryBuilder('review')
                                .select('AVG(review.rating)', 'average')
                                .addSelect('COUNT(review.id)', 'count')
                                .where('review.woocommerceProductId = :productId', { productId: woocommerceProductId })
                                .andWhere('review.isActive = :isActive', { isActive: true })
                                .getRawOne()];
                    case 2:
                        result = _b.sent();
                        return [4 /*yield*/, this.getRatingDistribution(woocommerceProductId)];
                    case 3:
                        ratingDistribution = _b.sent();
                        return [2 /*return*/, {
                                reviews: reviews,
                                total: total,
                                averageRating: parseFloat(result.average) || 0,
                                totalReviews: parseInt(result.count) || 0,
                                currentPage: page,
                                totalPages: Math.ceil(total / limit),
                                ratingDistribution: ratingDistribution
                            }];
                    case 4:
                        error_3 = _b.sent();
                        this.logger.error('Error getting product reviews:', error_3.message);
                        throw map_exception_1.mapException(error_3);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsService.prototype.canUserReview = function (userId, woocommerceProductId) {
        return __awaiter(this, void 0, Promise, function () {
            var product, completedOrders, hasPurchased, existingReview, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.buckyDropService.getProduct(woocommerceProductId)];
                    case 1:
                        product = _a.sent();
                        if (!product)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.ordersClient.send('get_user_completed_orders', { userId: userId }))];
                    case 2:
                        completedOrders = _a.sent();
                        hasPurchased = completedOrders.some(function (order) {
                            return order.items.some(function (item) { return item.woocommerceProductId === woocommerceProductId; });
                        });
                        if (!hasPurchased)
                            return [2 /*return*/, false];
                        return [4 /*yield*/, this.reviewRepository.findOne({
                                where: { userId: userId, woocommerceProductId: woocommerceProductId }
                            })];
                    case 3:
                        existingReview = _a.sent();
                        return [2 /*return*/, !existingReview];
                    case 4:
                        error_4 = _a.sent();
                        this.logger.error('Error checking review permission:', error_4.message);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsService.prototype.getUserReviews = function (userId, page, limit) {
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, reviews, total, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.reviewRepository.findAndCount({
                                where: { userId: userId, isActive: true },
                                relations: ['comments'],
                                order: { createdAt: 'DESC' },
                                skip: (page - 1) * limit,
                                take: limit
                            })];
                    case 1:
                        _a = _b.sent(), reviews = _a[0], total = _a[1];
                        return [2 /*return*/, {
                                reviews: reviews,
                                total: total,
                                currentPage: page,
                                totalPages: Math.ceil(total / limit)
                            }];
                    case 2:
                        error_5 = _b.sent();
                        this.logger.error('Error getting user reviews:', error_5.message);
                        throw map_exception_1.mapException(error_5);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ReviewsService.prototype.getRatingDistribution = function (productId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, distribution;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.reviewRepository
                            .createQueryBuilder('review')
                            .select('review.rating', 'rating')
                            .addSelect('COUNT(*)', 'count')
                            .where('review.woocommerceProductId = :productId', { productId: productId })
                            .andWhere('review.isActive = :isActive', { isActive: true })
                            .groupBy('review.rating')
                            .orderBy('review.rating', 'DESC')
                            .getRawMany()];
                    case 1:
                        result = _a.sent();
                        distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                        result.forEach(function (item) {
                            distribution[Math.floor(item.rating)] = parseInt(item.count);
                        });
                        return [2 /*return*/, distribution];
                }
            });
        });
    };
    ReviewsService.prototype.deleteComment = function (userId, commentId) {
        return __awaiter(this, void 0, void 0, function () {
            var comment, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.commentRepository.findOne({
                                where: { id: commentId, userId: userId }
                            })];
                    case 1:
                        comment = _a.sent();
                        if (!comment) {
                            throw new common_1.NotFoundException('Comment not found');
                        }
                        return [4 /*yield*/, this.commentRepository.remove(comment)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_6 = _a.sent();
                        this.logger.error('Error deleting comment:', error_6.message);
                        throw map_exception_1.mapException(error_6);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    var ReviewsService_1;
    ReviewsService = ReviewsService_1 = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(review_entity_1.Review)),
        __param(1, typeorm_1.InjectRepository(comment_entity_1.Comment)),
        __param(2, common_1.Inject('ORDERS_SERVICE'))
    ], ReviewsService);
    return ReviewsService;
}());
exports.ReviewsService = ReviewsService;
