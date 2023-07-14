// create a simple test to check if the server is running
const request = require('supertest')
const app = require('../../app')

describe('GET /', () => {
    let accessToken
	it('should return 200 OK and JWT', async () => {
		const response = await request(app)
			.post('/api/v1/auth/login')
			.send({ username: 'votri', password: '12345' })
			.expect(200)

		accessToken = response.body.token
		expect(response.body.token).toBeDefined()
	})

	describe('Follow a user', () => {
		it('should return 200 OK', async () => {
			const response = await request(app)
				.patch('/api/v1/user/follow/votri_mqhmj1689318951844')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
		})
	})

    describe('Follow another user', () => {
		it('should return 200 OK', async () => {
			const response = await request(app)
				.patch('/api/v1/user/follow/votri_xbjlw1689318924914')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
		})
	})


})
