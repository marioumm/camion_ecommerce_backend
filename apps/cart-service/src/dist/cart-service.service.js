"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.CartServiceService = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var common_1 = require("@nestjs/common");
var axios_1 = require("axios");
var typeorm_1 = require("@nestjs/typeorm");
var microservices_1 = require("@nestjs/microservices");
var rxjs_1 = require("rxjs");
var cart_entity_1 = require("./entities/cart.entity");
var CartServiceService = /** @class */ (function () {
    function CartServiceService(cartRepository, usersClient, affiliateClient, notificationsClient) {
        this.cartRepository = cartRepository;
        this.usersClient = usersClient;
        this.affiliateClient = affiliateClient;
        this.notificationsClient = notificationsClient;
        this.logger = new common_1.Logger(CartServiceService_1.name);
        this.WC_BASE_URL = process.env.WC_BASE_URL;
    }
    CartServiceService_1 = CartServiceService;
    CartServiceService.prototype.sendNotification = function (userId, title, body) {
        return __awaiter(this, void 0, void 0, function () {
            var deviceToken, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.usersClient.send({ cmd: 'get-user-device-token' }, { userId: userId }).pipe(rxjs_1.timeout(3000), rxjs_1.catchError(function () {
                                _this.logger.warn("No notification token found for user " + userId);
                                return [{ deviceToken: null }];
                            })))];
                    case 1:
                        deviceToken = (_a.sent()).deviceToken;
                        if (!deviceToken)
                            return [2 /*return*/];
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.notificationsClient.send({ cmd: 'send_push_notification' }, {
                                token: deviceToken,
                                title: title,
                                body: body,
                                userId: userId
                            }).pipe(rxjs_1.timeout(3000), rxjs_1.catchError(function (err) {
                                _this.logger.error("Failed to send notification: " + err.message);
                                return [];
                            })))];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        this.logger.error('Error sending notification', err_1.stack);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CartServiceService.prototype.verifyUserExists = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!userId)
                            throw new common_1.UnauthorizedException('Missing User ID');
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.usersClient.send({ cmd: 'users.getUserById' }, { id: userId }).pipe(rxjs_1.timeout(3000), rxjs_1.catchError(function () {
                                throw new common_1.UnauthorizedException('User does not exist (timeout)');
                            })))];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.UnauthorizedException('User does not exist');
                        return [2 /*return*/];
                }
            });
        });
    };
    CartServiceService.prototype.fetchCoupon = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.affiliateClient
                                .send({ cmd: 'affiliate.getCouponByCode' }, { code: code.trim().toUpperCase() })
                                .pipe(rxjs_1.timeout(3000), rxjs_1.catchError(function (err) {
                                var _a, _b, _c, _d, _e, _f;
                                console.error('[CartService] fetchCoupon error:', JSON.stringify(err), err);
                                var statusCode = (err === null || err === void 0 ? void 0 : err.statusCode) || (err === null || err === void 0 ? void 0 : err.status) || ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.statusCode) || ((_b = err === null || err === void 0 ? void 0 : err.error) === null || _b === void 0 ? void 0 : _b.status);
                                var message = (err === null || err === void 0 ? void 0 : err.message) || ((_c = err === null || err === void 0 ? void 0 : err.error) === null || _c === void 0 ? void 0 : _c.message) || ((_e = (_d = err === null || err === void 0 ? void 0 : err.error) === null || _d === void 0 ? void 0 : _d.response) === null || _e === void 0 ? void 0 : _e.message) || ((_f = err === null || err === void 0 ? void 0 : err.response) === null || _f === void 0 ? void 0 : _f.message) || (err === null || err === void 0 ? void 0 : err.response);
                                if (typeof statusCode === 'number' && message) {
                                    if (statusCode === 404)
                                        throw new common_1.NotFoundException(message);
                                    if (statusCode === 409)
                                        throw new common_1.ConflictException(message);
                                    if (statusCode === 400)
                                        throw new common_1.BadRequestException(message);
                                    if (statusCode === 401)
                                        throw new common_1.UnauthorizedException(message);
                                    throw new common_1.BadRequestException(message);
                                }
                                if (err instanceof microservices_1.RpcException) {
                                    throw new common_1.InternalServerErrorException('Microservice RPC exception: ' + (err.message || ''));
                                }
                                if (err instanceof common_1.NotFoundException ||
                                    err instanceof common_1.ConflictException ||
                                    err instanceof common_1.BadRequestException ||
                                    err instanceof common_1.UnauthorizedException)
                                    throw err;
                                throw new common_1.InternalServerErrorException('Affiliate service error: ' +
                                    (message || JSON.stringify(err) || ''));
                            })))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        if (err_2 instanceof common_1.NotFoundException ||
                            err_2 instanceof common_1.ConflictException ||
                            err_2 instanceof common_1.BadRequestException ||
                            err_2 instanceof common_1.UnauthorizedException)
                            throw err_2;
                        console.error('[CartService] fetchCoupon outer error:', err_2);
                        throw new common_1.InternalServerErrorException('Failed to fetch coupon');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CartServiceService.prototype.fetchProductFromWoo = function (productId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var url, res, data, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        url = this.WC_BASE_URL + "/products/sync/" + productId;
                        return [4 /*yield*/, axios_1["default"].get(url)];
                    case 1:
                        res = _c.sent();
                        data = res.data;
                        console.log(res);
                        return [2 /*return*/, {
                                id: data.id,
                                title: data.name,
                                image: ((_b = (_a = data.images) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.src) || null,
                                price: data.prices.sale_price || data.prices.price || '0'
                            }];
                    case 2:
                        error_1 = _c.sent();
                        throw new common_1.NotFoundException('Product not found in WooCommerce');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CartServiceService.prototype.addToCart = function (dto, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userPreferences, product_1, convertedPrice, existing, savedItem, totalPrice, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _a.sent();
                        if (!dto.productId)
                            throw new common_1.BadRequestException('Missing productId');
                        if (!dto.quantity || dto.quantity <= 0)
                            throw new common_1.BadRequestException('Quantity must be greater than 0');
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.usersClient.send('get_user_preferences', { userId: userId }).pipe(rxjs_1.timeout(3000), rxjs_1.catchError(function () { return rxjs_1.of({
                                preferredCurrency: 'USD',
                                preferredLocale: 'en'
                            }); })))];
                    case 2:
                        userPreferences = _a.sent();
                        return [4 /*yield*/, this.fetchProductFromWoo(dto.productId)];
                    case 3:
                        product_1 = _a.sent();
                        if (!product_1)
                            throw new common_1.NotFoundException('Product not found in WooCommerce');
                        return [4 /*yield*/, rxjs_1.firstValueFrom(this.usersClient.send('convert_single_price', {
                                userId: userId,
                                amount: parseFloat(product_1.price),
                                fromCurrency: 'QAR'
                            }).pipe(rxjs_1.timeout(5000), rxjs_1.catchError(function (err) {
                                _this.logger.warn("Price conversion failed: " + err.message);
                                return rxjs_1.of({
                                    convertedAmount: parseFloat(product_1.price),
                                    currency: 'QAR',
                                    currencySymbol: 'ر.ق',
                                    originalAmount: parseFloat(product_1.price),
                                    originalCurrency: 'QAR'
                                });
                            })))];
                    case 4:
                        convertedPrice = _a.sent();
                        return [4 /*yield*/, this.cartRepository.findOne({
                                where: { userId: userId, productId: dto.productId }
                            })];
                    case 5:
                        existing = _a.sent();
                        savedItem = void 0;
                        if (!existing) return [3 /*break*/, 7];
                        existing.quantity += dto.quantity;
                        existing.title = product_1.title;
                        existing.image = product_1.image;
                        existing.price = convertedPrice.convertedAmount.toString();
                        existing.currency = convertedPrice.currency;
                        existing.currencySymbol = convertedPrice.currencySymbol;
                        existing.originalPrice = product_1.price;
                        return [4 /*yield*/, this.cartRepository.save(existing)];
                    case 6:
                        savedItem = _a.sent();
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this.cartRepository.save({
                            userId: userId,
                            productId: product_1.id,
                            quantity: dto.quantity,
                            title: product_1.title,
                            image: product_1.image,
                            price: convertedPrice.convertedAmount.toString(),
                            currency: convertedPrice.currency,
                            currencySymbol: convertedPrice.currencySymbol,
                            originalPrice: product_1.price,
                            variation: dto.variation
                        })];
                    case 8:
                        savedItem = _a.sent();
                        _a.label = 9;
                    case 9:
                        totalPrice = Number(savedItem.price) * savedItem.quantity;
                        return [4 /*yield*/, this.sendNotification(userId, 'Product added to cart successfully 🛒', product_1.title + " added for " + convertedPrice.convertedAmount + " " + convertedPrice.currencySymbol)];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, savedItem), { totalPrice: totalPrice, formattedPrice: savedItem.price + " " + savedItem.currencySymbol, formattedTotal: totalPrice.toFixed(2) + " " + savedItem.currencySymbol })];
                    case 11:
                        error_2 = _a.sent();
                        if (error_2 instanceof common_1.BadRequestException ||
                            error_2 instanceof common_1.UnauthorizedException ||
                            error_2 instanceof common_1.NotFoundException ||
                            error_2 instanceof common_1.ConflictException)
                            throw error_2;
                        this.logger.error('Failed to add to cart', error_2.stack);
                        throw new common_1.InternalServerErrorException('Failed to add to cart');
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    CartServiceService.prototype.isProductInCart = function (userId, productId) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _a.sent();
                        if (!productId)
                            throw new common_1.BadRequestException('Missing productId');
                        return [4 /*yield*/, this.cartRepository.findOne({
                                where: { userId: userId, productId: productId }
                            })];
                    case 2:
                        item = _a.sent();
                        return [2 /*return*/, { exists: !!item }];
                }
            });
        });
    };
    CartServiceService.prototype.updateQuantity = function (dto, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var item, saved, totalPrice;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _a.sent();
                        if (!dto.productId)
                            throw new common_1.BadRequestException('Missing productId');
                        if (!dto.quantity || dto.quantity <= 0)
                            throw new common_1.BadRequestException('Quantity must be greater than 0');
                        return [4 /*yield*/, this.cartRepository.findOne({
                                where: { userId: userId, productId: dto.productId }
                            })];
                    case 2:
                        item = _a.sent();
                        if (!item)
                            throw new common_1.NotFoundException('Cart item not found');
                        item.quantity = dto.quantity;
                        return [4 /*yield*/, this.cartRepository.save(item)];
                    case 3:
                        saved = _a.sent();
                        totalPrice = Number(saved.price) * saved.quantity;
                        return [2 /*return*/, __assign(__assign({}, saved), { totalPrice: totalPrice, formattedPrice: saved.price + " " + saved.currencySymbol, formattedTotal: totalPrice.toFixed(2) + " " + saved.currencySymbol })];
                }
            });
        });
    };
    CartServiceService.prototype.getCart = function (userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var items, enhancedItems, grandTotal, currency, currencySymbol;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.cartRepository.find({ where: { userId: userId } })];
                    case 2:
                        items = _c.sent();
                        enhancedItems = items.map(function (item) {
                            var itemTotal = Number(item.price || 0) * item.quantity;
                            return __assign(__assign({}, item), { formattedPrice: item.price + " " + item.currencySymbol, formattedOriginalPrice: item.originalPrice + " \u0631.\u0642", itemTotal: itemTotal, formattedItemTotal: itemTotal.toFixed(2) + " " + item.currencySymbol });
                        });
                        grandTotal = enhancedItems.reduce(function (sum, item) { return sum + item.itemTotal; }, 0);
                        currency = ((_a = items[0]) === null || _a === void 0 ? void 0 : _a.currency) || 'USD';
                        currencySymbol = ((_b = items[0]) === null || _b === void 0 ? void 0 : _b.currencySymbol) || '$';
                        return [2 /*return*/, {
                                items: enhancedItems,
                                summary: {
                                    totalItems: items.length,
                                    grandTotal: grandTotal,
                                    currency: currency,
                                    currencySymbol: currencySymbol,
                                    formattedGrandTotal: grandTotal.toFixed(2) + " " + currencySymbol
                                }
                            }];
                }
            });
        });
    };
    CartServiceService.prototype.removeFromCart = function (dto, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _a.sent();
                        if (!dto.productId)
                            throw new common_1.BadRequestException('Missing productId');
                        return [4 /*yield*/, this.cartRepository.findOne({
                                where: { userId: userId, productId: dto.productId }
                            })];
                    case 2:
                        item = _a.sent();
                        if (!item)
                            throw new common_1.NotFoundException('Cart item not found');
                        return [4 /*yield*/, this.cartRepository.remove(item)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.sendNotification(userId, 'Item removed from cart 🛒', item.title + " has been removed from your cart.")];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, { message: 'Item removed successfully' }];
                }
            });
        });
    };
    CartServiceService.prototype.clearCart = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.cartRepository.find({ where: { userId: userId } })];
                    case 2:
                        items = _a.sent();
                        if (!items.length)
                            throw new common_1.NotFoundException('Cart is already empty');
                        return [4 /*yield*/, this.cartRepository.remove(items)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.sendNotification(userId, 'Cart cleared 🧹', 'Your cart has been cleared successfully.')];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, { message: 'Cart cleared successfully' }];
                }
            });
        });
    };
    CartServiceService.prototype.applyCouponToCart = function (userId, couponCode) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var cartItems, coupon_1, total, discount, totalAfterDiscount, currency, currencySymbol, error_3;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.verifyUserExists(userId)];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, this.cartRepository.find({ where: { userId: userId } })];
                    case 2:
                        cartItems = _c.sent();
                        if (!cartItems.length)
                            throw new common_1.NotFoundException('Cart is empty');
                        return [4 /*yield*/, this.fetchCoupon(couponCode)];
                    case 3:
                        coupon_1 = _c.sent();
                        if (!coupon_1)
                            throw new common_1.NotFoundException('Invalid coupon code');
                        return [4 /*yield*/, Promise.all(cartItems.map(function (item) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            item.couponCode = couponCode;
                                            item.discountPercentage = coupon_1.discountPercentage;
                                            return [4 /*yield*/, this.cartRepository.save(item)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }))];
                    case 4:
                        _c.sent();
                        total = cartItems.reduce(function (sum, i) {
                            var priceNum = i.price ? parseFloat(i.price) : 0;
                            return sum + priceNum * i.quantity;
                        }, 0);
                        discount = (total * coupon_1.discountPercentage) / 100;
                        totalAfterDiscount = total - discount;
                        currency = ((_a = cartItems[0]) === null || _a === void 0 ? void 0 : _a.currency) || 'USD';
                        currencySymbol = ((_b = cartItems[0]) === null || _b === void 0 ? void 0 : _b.currencySymbol) || '$';
                        return [2 /*return*/, {
                                cartItems: cartItems,
                                total: total,
                                discount: discount,
                                totalAfterDiscount: totalAfterDiscount,
                                coupon: coupon_1,
                                currency: currency,
                                currencySymbol: currencySymbol,
                                formattedTotal: total.toFixed(2) + " " + currencySymbol,
                                formattedDiscount: discount.toFixed(2) + " " + currencySymbol,
                                formattedFinalTotal: totalAfterDiscount.toFixed(2) + " " + currencySymbol
                            }];
                    case 5:
                        error_3 = _c.sent();
                        if (error_3 instanceof common_1.BadRequestException ||
                            error_3 instanceof common_1.UnauthorizedException ||
                            error_3 instanceof common_1.NotFoundException ||
                            error_3 instanceof common_1.ConflictException)
                            throw error_3;
                        this.logger.error('Failed to apply coupon', error_3.stack);
                        throw new common_1.InternalServerErrorException('Failed to apply coupon');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    var CartServiceService_1;
    CartServiceService = CartServiceService_1 = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(cart_entity_1.CartItem)),
        __param(1, common_1.Inject('USERS_SERVICE')),
        __param(2, common_1.Inject('AFFILIATE_SERVICE')),
        __param(3, common_1.Inject('NOTIFICATIONS_SERVICE'))
    ], CartServiceService);
    return CartServiceService;
}());
exports.CartServiceService = CartServiceService;
