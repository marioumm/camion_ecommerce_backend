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
exports.CurrencySeeder = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// apps/users-service/src/database/currency.seeder.ts
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var currency_entity_1 = require("../entities/currency.entity");
var CurrencySeeder = /** @class */ (function () {
    function CurrencySeeder(currencyRepo) {
        this.currencyRepo = currencyRepo;
    }
    CurrencySeeder.prototype.seed = function () {
        return __awaiter(this, void 0, Promise, function () {
            var currencies, addedCount, _i, currencies_1, currencyData, exists, currency;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🌱 Starting currency seeding...');
                        return [4 /*yield*/, this.createTable()];
                    case 1:
                        _a.sent();
                        currencies = [
                            { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0000 },
                            { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.8500 },
                            { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.7300 },
                            { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', rate: 3.6400 },
                            { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 3.7500 },
                            { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.6700 },
                            { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', rate: 30.9000 },
                            { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 27.0000 },
                            { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.0000 },
                            { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.2500 },
                        ];
                        addedCount = 0;
                        _i = 0, currencies_1 = currencies;
                        _a.label = 2;
                    case 2:
                        if (!(_i < currencies_1.length)) return [3 /*break*/, 7];
                        currencyData = currencies_1[_i];
                        return [4 /*yield*/, this.currencyRepo.findOne({
                                where: { code: currencyData.code }
                            })];
                    case 3:
                        exists = _a.sent();
                        if (!!exists) return [3 /*break*/, 5];
                        currency = this.currencyRepo.create(__assign(__assign({}, currencyData), { isActive: true }));
                        return [4 /*yield*/, this.currencyRepo.save(currency)];
                    case 4:
                        _a.sent();
                        console.log("\u2705 Added: " + currencyData.code + " - " + currencyData.name);
                        addedCount++;
                        return [3 /*break*/, 6];
                    case 5:
                        console.log("\u23ED\uFE0F Currency " + currencyData.code + " already exists");
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        console.log("\uD83C\uDF89 Seeding completed! Added " + addedCount + " new currencies");
                        return [2 /*return*/];
                }
            });
        });
    };
    CurrencySeeder.prototype.createTable = function () {
        return __awaiter(this, void 0, Promise, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.currencyRepo.query("\n        CREATE TABLE IF NOT EXISTS currencies (\n          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n          code VARCHAR(3) UNIQUE NOT NULL,\n          name VARCHAR(50) NOT NULL,\n          symbol VARCHAR(10) NOT NULL,\n          rate DECIMAL(10,6) DEFAULT 1,\n          is_active BOOLEAN DEFAULT true,\n          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n        )\n      ")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.currencyRepo.query("\n        CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code)\n      ")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.currencyRepo.query("\n        CREATE INDEX IF NOT EXISTS idx_currencies_active ON currencies(is_active)\n      ")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.currencyRepo.query("\n        ALTER TABLE users \n        ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',\n        ADD COLUMN IF NOT EXISTS preferred_locale VARCHAR(5) DEFAULT 'en'\n      ")];
                    case 4:
                        _a.sent();
                        console.log('📊 Database schema ready!');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.log('Schema already exists:', error_1.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CurrencySeeder = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(currency_entity_1.Currency))
    ], CurrencySeeder);
    return CurrencySeeder;
}());
exports.CurrencySeeder = CurrencySeeder;
