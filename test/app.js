/* eslint-env mocha */

process.env.TWITTER_KEY = 'dummy';
process.env.TWITTER_SECRET = 'dummy';
process.env.MONGODB_URI = 'mongodb://localhost:27017/esolang-battle';
process.env.SESSION_SECRET = 'secret';

const request = require('supertest');
const app = require('../app.js');

describe('Router', function () {
	this.timeout(10000);

	describe('GET /', () => {
		it('should return 200 OK', (done) => {
			request(app)
				.get('/')
				.expect(200, done);
		});
	});

	describe('GET /login', () => {
		it('should return 200 OK', (done) => {
			request(app)
				.get('/login')
				.expect(200, done);
		});
	});

	describe('GET /random-url', () => {
		it('should return 404', (done) => {
			request(app)
				.get('/reset')
				.expect(404, done);
		});
	});
});
