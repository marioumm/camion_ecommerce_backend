"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ReviewsModule = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var microservices_1 = require("@nestjs/microservices");
var axios_1 = require("@nestjs/axios");
var config_1 = require("@nestjs/config");
var review_entity_1 = require("./entities/review.entity");
var reviews_service_controller_1 = require("./reviews-service.controller");
var reviews_service_service_1 = require("./reviews-service.service");
var buckydrop_http_service_1 = require("./shared/buckydrop-http.service");
var comment_entity_1 = require("./entities/comment.entity");
var ReviewsModule = /** @class */ (function () {
    function ReviewsModule() {
    }
    ReviewsModule = __decorate([
        common_1.Module({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true
                }),
                typeorm_1.TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: process.env.POSTGRES_HOST,
                    port: Number(process.env.POSTGRES_PORT),
                    username: process.env.POSTGRES_USER,
                    password: process.env.POSTGRES_PASSWORD,
                    database: process.env.POSTGRES_DB,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                typeorm_1.TypeOrmModule.forFeature([review_entity_1.Review, comment_entity_1.Comment]),
                axios_1.HttpModule,
                microservices_1.ClientsModule.registerAsync([
                    {
                        name: 'ORDERS_SERVICE',
                        imports: [config_1.ConfigModule],
                        useFactory: function (config) { return ({
                            transport: microservices_1.Transport.TCP,
                            options: {
                                host: config.get('ORDER_SERVICE_HOST'),
                                port: Number(config.get('ORDERS_TCP_PORT'))
                            }
                        }); },
                        inject: [config_1.ConfigService]
                    },
                ]),
            ],
            controllers: [reviews_service_controller_1.ReviewsController],
            providers: [reviews_service_service_1.ReviewsService, buckydrop_http_service_1.BuckyDropHttpService],
            exports: [reviews_service_service_1.ReviewsService]
        })
    ], ReviewsModule);
    return ReviewsModule;
}());
exports.ReviewsModule = ReviewsModule;
