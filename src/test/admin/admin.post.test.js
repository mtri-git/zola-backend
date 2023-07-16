const request = require('supertest')
const app = require('../../app') // Đây là file chứa Express app của bạn

describe('Post API for admin', () => {
	let accessToken

	it('should return a JWT token if the credentials are correct', async () => {
		const response = await request(app)
			.post('/api/v1/admin/auth/login')
			.send({ username: 'admin', password: '123' })
			.expect(200)
		accessToken = response.body.token
		// expect(response.body.token).toBeDefined()
	})

    let listPost = []
	describe('GET user list /admin/post?offset=1', () => {
		it('Should return data contain list of user', async () => {
			const response = await request(app)
				.get('/api/v1/admin/user?offset=1')
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
            listPost = response.body.data
			expect(response.body.data).toBeDefined()
            expect(listPost.length).toBeGreaterThan(0)
		})
	})

	describe('Get User Detail', () => {
		it('Should return data of post', async () => {
            const postId = listPost[0]._id
			const response = await request(app)
				.get(`/api/v1/admin/user/${postId}`)
				.set('Authorization', `Bearer ${accessToken}`)
				.expect(200)
            expect(response.body.data).toBeDefined()
            expect(response.body.data._id).toBe(postId)
		})
	})
})
