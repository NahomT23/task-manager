"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRedisHealth = void 0;
const redis_1 = require("@upstash/redis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const redis = new redis_1.Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_TOKEN
});
exports.default = redis;
function checkRedisConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield redis.ping();
            console.log('Redis connection status:', response);
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
        }
    });
}
checkRedisConnection();
const checkRedisHealth = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield redis.ping();
        console.log(`Redis Health Check: ${response}`);
        return response === "PONG";
    }
    catch (error) {
        console.error('Error connecting to Upstash Redis:', error);
        return false;
    }
});
exports.checkRedisHealth = checkRedisHealth;
// Immediately invoke the health check when the module loads
(function initialHealthCheck() {
    return __awaiter(this, void 0, void 0, function* () {
        const healthy = yield (0, exports.checkRedisHealth)();
        if (healthy) {
            console.log('Upstash Redis is healthy.');
        }
        else {
            console.error('Upstash Redis is NOT healthy.');
        }
    });
})();
