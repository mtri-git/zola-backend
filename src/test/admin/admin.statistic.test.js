const request = require('supertest')
const app = require('../../app') // Đây là file chứa Express app của bạn

describe('Statistic API', () => {
	let accessToken

	it('should return a JWT token if the credentials are correct', async () => {
		const response = await request(app)
			.post('/api/v1/admin/auth/login')
			.send({ username: 'admin', password: '123' })
			.expect(200)
		accessToken = response.body.token
		// expect(response.body.token).toBeDefined()
	})

	describe('GET /api/v1/admin/statistic/number', () => {
		it('Should return data contain total user, total room, total message', async () => {
			const response = await request(app)
				.get('/api/v1/admin/statistic/number')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
			expect(response.body.data.userNumber).toBeDefined()
			expect(response.body.data.postNumber).toBeDefined()
			expect(response.body.data.commentNumber).toBeDefined()
			expect(response.body.data.chatNumber).toBeDefined()
			expect(response.body.data.roomNumber).toBeDefined()
		})
	})

	describe('Get User join by month', () => {
		it('Should return data of user join by month', async () => {
			const response = await request(app)
				.get('/api/v1/statistic/user-join-by-mouth')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
		})
	})

	describe('Group User by age', () => {
		it('Should return data of user by age', async () => {
			const response = await request(app)
				.get('/api/v1/statistic/user-by-age')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
		})
	})
})
