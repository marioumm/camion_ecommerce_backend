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
exports.CurrencyService = void 0;
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var typeorm_2 = require("typeorm");
var currency_entity_1 = require("./entities/currency.entity");
var schedule_1 = require("@nestjs/schedule");
var CurrencyService = /** @class */ (function () {
    function CurrencyService(currencyRepo, httpService) {
        this.currencyRepo = currencyRepo;
        this.httpService = httpService;
        this.FIXER_API_KEY = process.env.FIXER_API_KEY;
        this.WOOCOMMERCE_BASE_CURRENCY = 'QAR';
        this.FIXER_BASE_CURRENCY = 'USD';
    }
    CurrencyService.prototype.getAllCurrencies = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.currencyRepo.find({
                        where: { isActive: true },
                        order: { code: 'ASC' }
                    })];
            });
        });
    };
    CurrencyService.prototype.getCurrencyByCode = function (code) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.currencyRepo.findOne({
                        where: { code: code.toUpperCase(), isActive: true }
                    })];
            });
        });
    };
    CurrencyService.prototype.convertPrice = function (amount, fromCurrency, toCurrency) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var currencies, fromRate, toRate, baseAmount, convertedAmount;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (fromCurrency === toCurrency)
                            return [2 /*return*/, Number(amount.toFixed(2))];
                        return [4 /*yield*/, this.currencyRepo.find({
                                where: {
                                    code: typeorm_2.In([fromCurrency.toUpperCase(), toCurrency.toUpperCase()]),
                                    isActive: true
                                }
                            })];
                    case 1:
                        currencies = _c.sent();
                        fromRate = ((_a = currencies.find(function (c) { return c.code === fromCurrency.toUpperCase(); })) === null || _a === void 0 ? void 0 : _a.rate) || 1;
                        toRate = ((_b = currencies.find(function (c) { return c.code === toCurrency.toUpperCase(); })) === null || _b === void 0 ? void 0 : _b.rate) || 1;
                        baseAmount = amount / fromRate;
                        convertedAmount = baseAmount * toRate;
                        return [2 /*return*/, Number(convertedAmount.toFixed(2))];
                }
            });
        });
    };
    CurrencyService.prototype.updateExchangeRates = function () {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var response, rates, _i, _c, _d, code, rate, updateResult, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 8]);
                        console.log('🔄 Updating exchange rates from Fixer.io...');
                        if (!this.FIXER_API_KEY) {
                            throw new Error('FIXER_API_KEY is not configured');
                        }
                        return [4 /*yield*/, this.httpService.get("https://api.fixer.io/v1/latest?access_key=" + this.FIXER_API_KEY + "&base=" + this.FIXER_BASE_CURRENCY).toPromise()];
                    case 1:
                        response = _e.sent();
                        rates = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.rates;
                        if (!rates) {
                            throw new Error('Failed to fetch exchange rates from Fixer.io');
                        }
                        return [4 /*yield*/, this.currencyRepo.update({ code: this.FIXER_BASE_CURRENCY }, { rate: 1.0, updatedAt: new Date() })];
                    case 2:
                        _e.sent();
                        _i = 0, _c = Object.entries(rates);
                        _e.label = 3;
                    case 3:
                        if (!(_i < _c.length)) return [3 /*break*/, 6];
                        _d = _c[_i], code = _d[0], rate = _d[1];
                        return [4 /*yield*/, this.currencyRepo.update({ code: code.toUpperCase() }, { rate: rate, updatedAt: new Date() })];
                    case 4:
                        updateResult = _e.sent();
                        if (((_b = updateResult.affected) !== null && _b !== void 0 ? _b : 0) > 0) {
                            console.log("\u2705 Updated " + code + ": " + rate);
                        }
                        _e.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        console.log('✅ Exchange rates updated successfully');
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _e.sent();
                        console.error('❌ Failed to update exchange rates:', error_1.message);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CurrencyService.prototype.convertWooCommerceProducts = function (products, userCurrency) {
        return __awaiter(this, void 0, Promise, function () {
            var targetCurrency, convertedProducts, _i, products_1, product, convertedPrice, convertedRegularPrice, convertedSalePrice;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (userCurrency === this.WOOCOMMERCE_BASE_CURRENCY) {
                            return [2 /*return*/, products.map(function (product) { return (__assign(__assign({}, product), { currency: _this.WOOCOMMERCE_BASE_CURRENCY, currencySymbol: 'ر.ق' })); })];
                        }
                        return [4 /*yield*/, this.getCurrencyByCode(userCurrency)];
                    case 1:
                        targetCurrency = _a.sent();
                        if (!targetCurrency) {
                            throw new Error("Currency " + userCurrency + " is not supported");
                        }
                        convertedProducts = [];
                        _i = 0, products_1 = products;
                        _a.label = 2;
                    case 2:
                        if (!(_i < products_1.length)) return [3 /*break*/, 9];
                        product = products_1[_i];
                        return [4 /*yield*/, this.convertPrice(product.price, this.WOOCOMMERCE_BASE_CURRENCY, userCurrency)];
                    case 3:
                        convertedPrice = _a.sent();
                        convertedRegularPrice = null;
                        if (!product.regular_price) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.convertPrice(product.regular_price, this.WOOCOMMERCE_BASE_CURRENCY, userCurrency)];
                    case 4:
                        convertedRegularPrice = _a.sent();
                        _a.label = 5;
                    case 5:
                        convertedSalePrice = null;
                        if (!product.sale_price) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.convertPrice(product.sale_price, this.WOOCOMMERCE_BASE_CURRENCY, userCurrency)];
                    case 6:
                        convertedSalePrice = _a.sent();
                        _a.label = 7;
                    case 7:
                        convertedProducts.push(__assign(__assign({}, product), { price: convertedPrice, regular_price: convertedRegularPrice, sale_price: convertedSalePrice, original_price: product.price, original_currency: this.WOOCOMMERCE_BASE_CURRENCY, currency: userCurrency, currencySymbol: targetCurrency.symbol }));
                        _a.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, convertedProducts];
                }
            });
        });
    };
    __decorate([
        schedule_1.Cron('0 * * * *')
    ], CurrencyService.prototype, "updateExchangeRates");
    CurrencyService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(currency_entity_1.Currency))
    ], CurrencyService);
    return CurrencyService;
}());
exports.CurrencyService = CurrencyService;
