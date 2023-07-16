const request = require('supertest')
const app = require('../../app') // Đây là file chứa Express app của bạn

describe('Room API for admin', () => {
	let accessToken

	it('should return a JWT token if the credentials are correct', async () => {
		const response = await request(app)
			.post('/api/v1/admin/auth/login')
			.send({ username: 'admin', password: '123' })
			.expect(200)
		accessToken = response.body.token
		// expect(response.body.token).toBeDefined()
	})

    let listRoom = []
	describe('GET room list /room/user?offset=1', () => {
		it('Should return data contain list of user', async () => {
			const response = await request(app)
				.get('/api/v1/admin/room?offset=1')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
            listRoom = response.body.data
			expect(response.body.data).toBeDefined()
            expect(listRoom.length).toBeGreaterThan(0)
		})
	})

	describe('Get User Detail', () => {
		it('Should return data of room', async () => {
            const roomId = listRoom[0]._id
			const response = await request(app)
				.get(`/api/v1/admin/room/${roomId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
            expect(response.body.data).toBeDefined()
            expect(response.body.data._id).toBe(roomId)
		})
	})
})
