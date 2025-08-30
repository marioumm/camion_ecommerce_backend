"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.SettingsServiceService = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// settings-service/src/settings-service.service.ts
var common_1 = require("@nestjs/common");
var fs_1 = require("fs");
var path = require("path");
var SettingsServiceService = /** @class */ (function () {
    function SettingsServiceService() {
    }
    SettingsServiceService.prototype.saveLogo = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadsDir, _a, ext, filename, filepath, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, fs_1.promises.access(uploadsDir)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        _a = _b.sent();
                        return [4 /*yield*/, fs_1.promises.mkdir(uploadsDir, { recursive: true })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        ext = path.extname(data.originalname);
                        filename = "logo" + ext;
                        filepath = path.join(uploadsDir, filename);
                        return [4 /*yield*/, fs_1.promises.writeFile(filepath, data.buffer)];
                    case 6:
                        _b.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: 'Logo uploaded successfully! ✅',
                                filename: filename,
                                path: "/uploads/logos/" + filename,
                                size: data.buffer.length
                            }];
                    case 7:
                        error_1 = _b.sent();
                        console.error('Error in saveLogo:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                message: 'Failed to upload logo',
                                error: error_1.message
                            }];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SettingsServiceService.prototype.getLogoPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var logoDir, _a, files, logoFile;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        logoDir = path.join(process.cwd(), 'uploads', 'logos');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.access(logoDir)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        return [2 /*return*/, { path: '/assets/default-logo.png' }];
                    case 4: return [4 /*yield*/, fs_1.promises.readdir(logoDir)];
                    case 5:
                        files = _b.sent();
                        logoFile = files.find(function (file) { return file.startsWith('logo.'); });
                        return [2 /*return*/, logoFile
                                ? { path: "/uploads/logos/" + logoFile }
                                : { path: '/assets/default-logo.png' }];
                }
            });
        });
    };
    SettingsServiceService = __decorate([
        common_1.Injectable()
    ], SettingsServiceService);
    return SettingsServiceService;
}());
exports.SettingsServiceService = SettingsServiceService;
