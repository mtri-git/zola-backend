// create a simple test to check if the server is running
const request = require('supertest')
const app = require('../../app')

let accessToken
describe('Login to get the accessToken', () => {
	it('should return 200 OK', async () => {
		const response = await request(app)
			.post('/api/v1/auth/login')
			.send({ username: 'votri', password: '12345' })
			.expect(200)

		accessToken = response.body.token
		expect(response.body.token).toBeDefined()
	})
}),
describe('Create new comment', () => {
	it('should return 201 OK', async () => {
		const response = await request(app)
		.post('/api/v1/comment/create')
		.set('Authorization', `Bearer ${accessToken}`)
		.send({
			postId: '64afc3a0eb59062fcfb01168',
			content: 'This is a test comment #test',
		})
		.expect(201)
		expect(response.body.message).toBe("Add a comment successful")
	})
})

describe('Reply a comment', () => {
	it('should return 201 OK', async () => {
		const response = await request(app)
		.post('/api/v1/comment/create')
		.set('Authorization', `Bearer ${accessToken}`)
		.send({
			postId: '64afc3a0eb59062fcfb01168',
			content: 'This is a test comment #test',
			parent_id: '64afc95c942c937b6fcb61e1'
		})
		.expect(201)
		expect(response.body.message).toBe("Add a comment successful")
	})
})

describe('Get reply comment', () => {
	it('should return 200 OK', async () => {
		const response = await request(app)
		.get('/api/v1/comment/64afc95c942c937b6fcb61e1')
		.set('Authorization', `Bearer ${accessToken}`)
		.expect(200)
		expect(response.body).toBeDefined();
	})
})

describe('Like or unlike a comment', () => {
	it('should return 200 OK', async () => {
		const response = await request(app)
		.put('/api/v1/comment/64afc95c942c937b6fcb61e1/like')
		.set('Authorization', `Bearer ${accessToken}`)
		.expect(200)
	})
})

describe('GET Comment from post /api/post/:id', () => {
	it('should return 200 OK', async () => {
		const response = await request(app)
		.get('/api/v1/post/64afc3a0eb59062fcfb01168')
		.set('Authorization', `Bearer ${accessToken}`)
		.expect(200);
	
	expect(response.body).toBeDefined();
})});
