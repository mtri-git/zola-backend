// create a simple test to check if the server is running
const request = require('supertest')
const app = require('../../app')

describe('Login to get the accessToken', () => {
	let accessToken
	it('should return 200 OK', async () => {
		const response = await request(app)
			.post('/api/v1/auth/login')
			.send({ username: 'votri', password: '12345' })
			.expect(200)

		accessToken = response.body.token
		expect(response.body.token).toBeDefined()
	})
    describe('GET Comment from post /api/post/:id', () => {
        it('should return 200 OK', async () => {
            const response = await request(app)
            .get('/api/v1/post/64afc3a0eb59062fcfb01168')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
        
        expect(response.body).toBeDefined();
    })});
})
